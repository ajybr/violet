# Ingestion Module

Generate embeddings from text/images and ingest into VioletDB.

## Tech Stack

- **Package Manager**: [uv](https://github.com/astral-sh/uv)
- **Embedding Models**: [sentence-transformers](https://sbert.net/), [CLIP](https://openai.com/clip/)
- **ML Framework**: [torch](https://pytorch.org/)
- **Image Processing**: [Pillow](https://python-pillow.org/)
- **API Server**: FastAPI, Uvicorn

## Setup

### 1. Download Required Models

This project requires two ML models. They will be cached in the `models/` directory.

#### Text Embedding Model (sentence-transformers)

```bash
cd ingest
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
```

This downloads the model to your Hugging Face cache (typically `~/.cache/huggingface/`). The code references it locally via:
```
models/models--sentence-transformers--all-MiniLM-L6-v2/snapshots/c9745ed1d9f207416be6d2e6f8de32d1f16199bf/
```

#### Image Embedding Model (CLIP)

```bash
python -c "from transformers import CLIPModel, CLIPProcessor; model = CLIPModel.from_pretrained('openai/clip-vit-base-32'); processor = CLIPProcessor.from_pretrained('openai/clip-vit-base-32')"
```

Then copy the downloaded model to the local models directory:

```bash
mkdir -p ingest/models/clip-ViT-B-32
cp -r ~/.cache/huggingface/hub/models--openai--clip-vit-base-32/* ingest/models/clip-ViT-B-32/
```

Or alternatively, clone directly:

```bash
git lfs install
git clone https://huggingface.co/openai/clip-vit-base-32 ingest/models/clip-ViT-B-32
```

### 2. Setup Sample Data (Optional)

If you want to test with sample data, place images in `data/images/` and text files in `data/text/`:

```bash
mkdir -p ingest/data/images ingest/data/text
# Add your .png images to data/images/
# Add your .txt files to data/text/
```

### 3. Install Dependencies

```bash
cd ingest
uv sync
```

## Usage

### Generate Text Embeddings

```bash
python -m ingest.embed_text --collection <collection_name> --text "your text here"
```

### Generate Image Embeddings

```bash
python -m ingest.embed_img --collection <collection_name> --image-path /path/to/image.jpg
```

### Run API Server (for batch ingestion)

```bash
uv run python -m ingest.server
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VIOLETDB_URL` | VioletDB API endpoint | `http://localhost:8000` |

## Dependencies

See [pyproject.toml](pyproject.toml) for full dependency list.