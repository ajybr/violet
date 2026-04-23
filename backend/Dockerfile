FROM lukemathwalker/cargo-chef:latest-rust-bookworm AS chef
WORKDIR /violetdb

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /violetdb/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin violetdb

FROM debian:bookworm-slim as runtime
WORKDIR /violetdb
COPY --from=builder /violetdb/target/release/violetdb /usr/local/bin

EXPOSE 8000
VOLUME ["/storage"]
ENTRYPOINT ["/usr/local/bin/violetdb"]

HEALTHCHECK --interval=5m \
    CMD curl -f http://localhost:8000/ || exit 1