use aide::openapi::{self, OpenApi};
use anyhow::Result;
use axum::{
	http::{header, Method},
	Extension, Server,
};
use http::Request;
use std::{env, net::SocketAddr};
use tower_http::{
	cors::{Any, CorsLayer},
	trace::TraceLayer,
};
use tracing::info_span;

use crate::{db, routes, shutdown::Shutdown};

#[allow(clippy::redundant_pub_crate)]
pub(crate) async fn start() -> Result<()> {
	let mut openapi = OpenApi {
		info: openapi::Info {
			title: "VioletDB".to_string(),
			version: env!("CARGO_PKG_VERSION").to_string(),
			..openapi::Info::default()
		},
		..OpenApi::default()
	};

	let db = db::from_store()?;
	let shutdown = Shutdown::new()?;
	let router = routes::handler().finish_api(&mut openapi);

	let router = router
		.layer(
			TraceLayer::new_for_http().make_span_with(|request: &Request<_>| {
				info_span!(
					"http_request",
					method = ?request.method(),
					uri = ?request.uri()
				)
			}),
		)
		.layer(Extension(openapi))
		.layer(shutdown.extension())
		.layer(db.extension())
		.layer(
			CorsLayer::new()
				.allow_origin(Any)
				.allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
				.allow_headers([header::CONTENT_TYPE]),
		);

	let addr = SocketAddr::from((
		[0, 0, 0, 0],
		env::var("PORT").map_or(Ok(8000), |p| p.parse())?,
	));

	tracing::info!("Starting server on {addr}...");
	Server::bind(&addr)
		.serve(router.into_make_service())
		.with_graceful_shutdown(shutdown.handle())
		.await?;

	Ok(())
}