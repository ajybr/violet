use aide::axum::{
	routing::{delete, get, post, put},
	ApiRouter,
};
use axum::{extract::Path, http::StatusCode, Extension};
use axum_jsonschema::Json;
use chrono::{DateTime, Utc};
use schemars::JsonSchema;
use std::time::Instant;

use crate::{
	db::{self, Collection, DbExtension, Embedding, Error as DbError, SimilarityResult},
	errors::HTTPError,
	similarity::Distance,
};

pub fn handler() -> ApiRouter {
	ApiRouter::new().nest(
		"/collections",
		ApiRouter::new()
			.api_route("/", get(list_collections))
			.api_route("/:collection_name", put(create_collection))
			.api_route("/:collection_name", post(query_collection))
			.api_route("/:collection_name", get(get_collection_info))
			.api_route("/:collection_name", delete(delete_collection))
			.api_route("/:collection_name/embeddings", get(get_collection_embeddings))
			.api_route("/:collection_name/insert", post(insert_into_collection)),
	)
}

/// List all collections
async fn list_collections(Extension(db): DbExtension) -> Result<Json<Vec<String>>, HTTPError> {
	tracing::trace!("Listing collections");
	let collections = db.list_collections()?;
	Ok(Json(collections))
}

#[derive(Debug, serde::Deserialize, JsonSchema)]
pub struct CreateCollectionBody {
    pub dimension: usize,
    pub distance: Distance,
}

/// Create a new collection
async fn create_collection(
	Path(collection_name): Path<String>,
	Extension(db): DbExtension,
	Json(req): Json<CreateCollectionBody>,
) -> Result<StatusCode, HTTPError> {
	tracing::trace!(
		"Creating collection {collection_name} with dimension {}",
		req.dimension
	);

	let create_result = db.create_collection(collection_name, req.dimension, req.distance);

	match create_result {
		Ok(_) => Ok(StatusCode::CREATED),
		Err(db::Error::UniqueViolation) => {
			Err(HTTPError::new("Collection already exists").with_status(StatusCode::CONFLICT))
		},
		Err(_) => Err(HTTPError::new("Couldn't create collection")),
	}
}

/// Get all embeddings for a collection
async fn get_collection_embeddings(
	Path(collection_name): Path<String>,
	Extension(db): DbExtension,
) -> Result<Json<Vec<Embedding>>, HTTPError> {
	tracing::trace!("Getting embeddings for collection {collection_name}");

	let embeddings = db.get_embeddings(&collection_name)?;
	Ok(Json(embeddings))
}

#[derive(Debug, serde::Deserialize, JsonSchema)]
struct QueryCollectionQuery {
	/// Vector to query with
	query: Vec<f32>,
	/// Number of results to return
	k: Option<usize>,
}

/// Query a collection
#[allow(clippy::significant_drop_tightening)]
async fn query_collection(
	Path(collection_name): Path<String>,
	Extension(db): DbExtension,
	Json(req): Json<QueryCollectionQuery>,
) -> Result<Json<Vec<SimilarityResult>>, HTTPError> {
	tracing::trace!("Querying collection {collection_name}");

	let collection = db
		.get_collection(&collection_name)?
		.ok_or_else(|| HTTPError::new("Collection not found").with_status(StatusCode::NOT_FOUND))?;

	if req.query.len() != collection.dimension {
		return Err(HTTPError::new("Query dimension mismatch").with_status(StatusCode::BAD_REQUEST));
	}

    let embeddings = db.get_embeddings(&collection_name)?;

	let instant = Instant::now();
	let results = collection.get_similarity(&embeddings, &req.query, req.k.unwrap_or(1));

	tracing::trace!("Query to {collection_name} took {:?}", instant.elapsed());
	Ok(Json(results))
}

#[derive(Debug, serde::Serialize, JsonSchema)]
struct CollectionInfo {
	/// Name of the collection
	name: String,
	/// Dimension of the embeddings in the collection
	dimension: usize,
	/// Distance function used for the collection
	distance: Distance,
	/// Number of embeddings in the collection
	embedding_count: usize,
	/// Creation time of the collection
	created_at: DateTime<Utc>,
}

/// Get collection info
#[allow(clippy::significant_drop_tightening)]
async fn get_collection_info(
	Path(collection_name): Path<String>,
	Extension(db): DbExtension,
) -> Result<Json<CollectionInfo>, HTTPError> {
	tracing::trace!("Getting collection info for {collection_name}");

	let collection = db
		.get_collection(&collection_name)?
		.ok_or_else(|| HTTPError::new("Collection not found").with_status(StatusCode::NOT_FOUND))?;

    let embeddings = db.get_embeddings(&collection_name)?;

	Ok(Json(CollectionInfo {
		name: collection.name,
		distance: collection.distance,
		dimension: collection.dimension,
		embedding_count: embeddings.len(),
		created_at: collection.created_at,
	}))
}

/// Delete a collection
async fn delete_collection(
	Path(collection_name): Path<String>,
	Extension(db): DbExtension,
) -> Result<StatusCode, HTTPError> {
	tracing::trace!("Deleting collection {collection_name}");

	let delete_result = db.delete_collection(&collection_name);

	match delete_result {
		Ok(_) => Ok(StatusCode::NO_CONTENT),
		Err(DbError::NotFound) => {
			Err(HTTPError::new("Collection not found").with_status(StatusCode::NOT_FOUND))
		},
		Err(_) => Err(HTTPError::new("Couldn't delete collection")),
	}
}

/// Insert a vector into a collection
async fn insert_into_collection(
	Path(collection_name): Path<String>,
	Extension(db): DbExtension,
	Json(embedding): Json<Embedding>,
) -> Result<StatusCode, HTTPError> {
	tracing::trace!("Inserting into collection {collection_name}");

	let insert_result = db.insert_into_collection(&collection_name, embedding);

	match insert_result {
		Ok(_) => Ok(StatusCode::CREATED),
		Err(DbError::NotFound) => {
			Err(HTTPError::new("Collection not found").with_status(StatusCode::NOT_FOUND))
		},
		Err(DbError::UniqueViolation) => {
			Err(HTTPError::new("Vector already exists").with_status(StatusCode::CONFLICT))
		},
		Err(DbError::DimensionMismatch) => Err(HTTPError::new(
			"The provided vector has the wrong dimension",
		)
		.with_status(StatusCode::BAD_REQUEST)),
        Err(_) => Err(HTTPError::new("Couldn't insert into collection")),
	}
}