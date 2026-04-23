use anyhow::Result;
use axum::Extension;
use chrono::{DateTime, Utc};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::{params, Connection, ToSql};
use schemars::JsonSchema;
use serde::{de::DeserializeOwned, Serialize};
use serde_json::Value;
use std::{
	collections::{BinaryHeap, HashMap},
	sync::Arc,
};

use crate::similarity::{get_cache_attr, get_distance_fn, normalize, Distance, ScoreIndex};

pub const STORE_PATH: &str = "./storage/db.sqlite";

#[allow(clippy::module_name_repetitions)]
pub type DbExtension = Extension<Arc<Db>>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
	#[error("Collection already exists")]
	UniqueViolation,

	#[error("Collection doesn't exist")]
	NotFound,

	#[error("The dimension of the vector doesn't match the dimension of the collection")]
	DimensionMismatch,

	#[error("Database error: {0}")]
	Db(#[from] rusqlite::Error),

	#[error("JSON error: {0}")]
	Json(#[from] serde_json::Error),

	#[error("Pool error: {0}")]
	Pool(#[from] r2d2::Error),

    #[error("Bincode error: {0}")]
    Bincode(#[from] bincode::Error),
}

#[derive(Debug)]
pub struct Db {
	pub pool: Pool<SqliteConnectionManager>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct SimilarityResult {
	score: f32,
	embedding: Embedding,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct Collection {
    pub name: String,
	/// Dimension of the vectors in the collection
	pub dimension: usize,
	/// Distance metric used for querying
	pub distance: Distance,
	/// Creation time of the collection
	pub created_at: DateTime<Utc>,
}

impl Collection {
	pub fn get_similarity(&self, embeddings: &[Embedding], query: &[f32], k: usize) -> Vec<SimilarityResult> {
		let memo_attr = get_cache_attr(self.distance, query);
		let distance_fn = get_distance_fn(self.distance);

		let scores = embeddings
			.iter()
			.enumerate()
			.map(|(index, embedding)| {
				let score = distance_fn(&embedding.vector, query, memo_attr);
				ScoreIndex { score, index }
			})
			.collect::<Vec<_>>();

		let mut heap = BinaryHeap::new();
		for score_index in scores {
			if heap.len() < k || score_index < *heap.peek().unwrap() {
				heap.push(score_index);

				if heap.len() > k {
					heap.pop();
				}
			}
		}

		heap.into_sorted_vec()
			.into_iter()
			.map(|ScoreIndex { score, index }| SimilarityResult {
				score,
				embedding: embeddings[index].clone(),
			})
			.collect()
	}
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct Embedding {
	pub id: String,
	pub vector: Vec<f32>,
	pub metadata: Option<HashMap<String, Value>>,
}

impl Db {
	pub fn new(path: &str) -> Result<Self> {
		let manager = SqliteConnectionManager::file(path);
		let pool = Pool::new(manager)?;
		let db = Self { pool };
		db.create_tables()?;
		Ok(db)
	}

	fn create_tables(&self) -> Result<(), Error> {
		let conn = self.pool.get()?;
		conn.execute_batch(
			"
			CREATE TABLE IF NOT EXISTS collections (
				name TEXT PRIMARY KEY,
				dimension INTEGER NOT NULL,
				distance TEXT NOT NULL,
				created_at TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS embeddings (
				id TEXT PRIMARY KEY,
				collection_name TEXT NOT NULL,
				vector BLOB NOT NULL,
				metadata TEXT,
				FOREIGN KEY (collection_name) REFERENCES collections (name) ON DELETE CASCADE
			);
			",
		)?;
		Ok(())
	}

	pub fn extension(self) -> DbExtension {
		Extension(Arc::new(self))
	}

	pub fn create_collection(
		&self,
		name: String,
		dimension: usize,
		distance: Distance,
	) -> Result<Collection, Error> {
		let conn = self.pool.get()?;
		let created_at = Utc::now();
		let created_at_str = created_at.to_rfc3339();

		let distance_str = distance.to_string();

		match conn.execute(
			"INSERT INTO collections (name, dimension, distance, created_at) VALUES (?1, ?2, ?3, ?4)",
			params![&name, dimension, &distance_str, &created_at_str],
		) {
			Ok(_) => Ok(Collection {
				name,
				dimension,
				distance,
				created_at,
			}),
			Err(rusqlite::Error::SqliteFailure(e, _))
				if e.extended_code == rusqlite::ffi::SQLITE_CONSTRAINT_PRIMARYKEY =>
			{
				Err(Error::UniqueViolation)
			}
			Err(e) => Err(e.into()),
		}
	}

	pub fn delete_collection(&self, name: &str) -> Result<(), Error> {
		let conn = self.pool.get()?;
		let changed = conn.execute("DELETE FROM collections WHERE name = ?1", params![name])?;
		if changed == 0 {
			return Err(Error::NotFound);
		}
		Ok(())
	}

	pub fn insert_into_collection(
		&self,
		collection_name: &str,
		mut embedding: Embedding,
	) -> Result<(), Error> {
		let collection = self.get_collection(collection_name)?.ok_or(Error::NotFound)?;

		if embedding.vector.len() != collection.dimension {
			return Err(Error::DimensionMismatch);
		}

		if collection.distance == Distance::Cosine {
			embedding.vector = normalize(&embedding.vector);
		}

		let conn = self.pool.get()?;
		let vector_bytes = bincode::serialize(&embedding.vector)?;
		let metadata_str = embedding
			.metadata
			.as_ref()
			.map(|m| serde_json::to_string(m))
			.transpose()?
			.unwrap_or_else(|| "null".to_string());

		match conn.execute(
			"INSERT INTO embeddings (id, collection_name, vector, metadata) VALUES (?1, ?2, ?3, ?4)",
			params![embedding.id, collection_name, vector_bytes, metadata_str],
		) {
			Ok(_) => Ok(()),
			Err(rusqlite::Error::SqliteFailure(e, _))
				if e.extended_code == rusqlite::ffi::SQLITE_CONSTRAINT_PRIMARYKEY =>
			{
				Err(Error::UniqueViolation)
			}
			Err(e) => Err(e.into()),
		}
	}

	pub fn get_collection(&self, name: &str) -> Result<Option<Collection>, Error> {
		let conn = self.pool.get()?;
		let mut stmt = conn.prepare("SELECT name, dimension, distance, created_at FROM collections WHERE name = ?1")?;
		let mut rows = stmt.query_map(params![name], |row| {
            let created_at_str: String = row.get(3)?;
			let created_at = DateTime::parse_from_rfc3339(&created_at_str).unwrap().with_timezone(&Utc);

			let distance_str: String = row.get(2)?;
			let distance: Distance = distance_str.parse().unwrap();

			Ok(Collection {
				name: row.get(0)?,
				dimension: row.get(1)?,
				distance,
				created_at,
			})
        })?;

        if let Some(row) = rows.next() {
            Ok(Some(row?))
        } else {
            Ok(None)
        }
	}

    pub fn get_embeddings(&self, collection_name: &str) -> Result<Vec<Embedding>, Error> {
        let conn = self.pool.get()?;
        let mut stmt = conn.prepare("SELECT id, vector, metadata FROM embeddings WHERE collection_name = ?1")?;
        let rows = stmt.query_map(params![collection_name], |row| {
            let vector_bytes: Vec<u8> = row.get(1)?;
            let vector: Vec<f32> = bincode::deserialize(&vector_bytes).unwrap();

            let metadata_str: String = row.get(2)?;
            let metadata: Option<HashMap<String, Value>> = serde_json::from_str(&metadata_str).unwrap();

            Ok(Embedding {
                id: row.get(0)?,
                vector,
                metadata,
            })
        })?;

        let mut embeddings = Vec::new();
        for row in rows {
            embeddings.push(row?);
        }
        Ok(embeddings)
    }

    pub fn list_collections(&self) -> Result<Vec<String>, Error> {
        let conn = self.pool.get()?;
        let mut stmt = conn.prepare("SELECT name FROM collections")?;
        let rows = stmt.query_map([], |row| row.get(0))?;

        let mut collections = Vec::new();
        for row in rows {
            collections.push(row?);
        }
        Ok(collections)
    }
}

pub fn from_store() -> anyhow::Result<Db> {
	Db::new(STORE_PATH)
}
