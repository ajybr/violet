# VioletDB - Multimodal Vector Database

A high-performance vector database for multimodal embeddings (text + images). Built with Rust (backend), Python (ingestion), and Next.js (frontend).

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Rust, Axum, Bincode, SQLite |
| **Ingestion** | Python, uv, sentence-transformers, CLIP, FastAPI, Uvicorn |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Zustand, Radix UI |

## Quick Start

### Option 1: Docker (Recommended)

> **Important:** Before running Docker, you must download the required ML models first. See [ingest/README.md](ingest/README.md) for setup instructions.

```bash
# 1. Download models to ingest/models/ (see ingest/README.md)
# 2. (Optional) Add sample data to ingest/data/

# 3. Build and run all services
docker compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - Ingest API: http://localhost:8001
```

### Option 2: Local Development

> **Important:** Before running ingestion, you must download the required ML models and sample datasets. See [ingest/README.md](ingest/README.md) for setup instructions.

### 1. Ingestion

Generate embeddings from text or images and ingest into the database.

See [ingest/README.md](ingest/README.md) for setup and usage.

### 2. Backend Server

Start the VioletDB API server.

See [backend/README.md](backend/README.md) for setup and usage.

### 3. Frontend Dashboard

Web interface for managing collections and querying embeddings.

See [frontend/README.md](frontend/README.md) for setup and usage.

## Architecture

```mermaid
flowchart TB
    subgraph User["User Layer"]
        UI["Web Dashboard\n(Next.js)"]
        API["REST API Client"]
    end

    subgraph ML["ML Layer"]
        ST["sentence-transformers\n(Text → Vector)"]
        CLIP["CLIP\n(Image → Vector)"]
    end

    subgraph Data["Data Layer"]
        TextData["Text Data"]
        Images["Image Data"]
    end

    subgraph Backend["VioletDB Backend (Rust)"]
        API_Server["API Server\n(Axum)"]
        InMemoryIndex["In-Memory Index\n(faiss-like)"]
        Persistence["SQLite + Bincode\nPersistence"]
        Collections["Collections\nManagement"]
    end

    TextData --> ST
    Images --> CLIP
    ST -->|"POST /collections/{id}/insert"| API_Server
    CLIP -->|"POST /collections/{id}/insert"| API_Server
    API_Server --> InMemoryIndex
    API_Server --> Persistence
    API_Server --> Collections
    UI -->|"Search & Manage"| API
    API -->|"HTTP Requests"| API_Server

    style ST fill:#f9f,stroke:#333,color:#000
    style CLIP fill:#f9f,stroke:#333,color:#000
    style API_Server fill:#bbf,stroke:#333,color:#000
    style InMemoryIndex fill:#bfb,stroke:#333,color:#000
```

## Features

- **Multimodal Embeddings**: Text (sentence-transformers) + Images (CLIP)
- **Vector Similarity**: Cosine, Euclidean, Dot Product
- **In-Memory Index**: Fast querying with SQLite persistence
- **REST API**: Full CRUD operations on collections
- **Web Dashboard**: Visual interface for search and management
