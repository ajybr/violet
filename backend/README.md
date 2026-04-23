# VioletDB Backend

A high-performance vector database API server built in Rust.

## Tech Stack

- **Web Framework**: [Axum](https://github.com/tokio-rs/axum)
- **Serialization**: [Bincode](https://github.com/bincode-org/bincode)
- **Database**: [SQLite](https://www.sqlite.org/) (via rusqlite)
- **Async Runtime**: [Tokio](https://tokio.rs/)

## Setup

### Build from Source

```bash
cd backend
cargo build --release
```

### Run the Server

```bash
cargo run --release
```

The server will start at `http://localhost:8000`.

### Docker

```bash
docker run -p 8000:8000 violetdb
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/collections` | List all collections |
| `PUT` | `/collections/:name` | Create collection |
| `DELETE` | `/collections/:name` | Delete collection |
| `POST` | `/collections/:name/insert` | Insert vectors |
| `POST` | `/collections/:name` | Query similarity |
| `GET` | `/docs` | OpenAPI documentation |

## Configuration

The backend listens on `0.0.0.0:8000` by default. Data is persisted to `./storage` directory.

## Features

- Cosine, Euclidean, and Dot Product distance metrics
- In-memory vector index with SQLite persistence
- OpenAPI-generated documentation at `/docs`