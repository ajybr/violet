import os
import json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from PIL import Image
import io
import base64


# -------------------------------
# init models
# -------------------------------

root = os.path.dirname(__file__)

text_model_path = os.path.join(
    root,
    "./models/models--sentence-transformers--all-MiniLM-L6-v2/snapshots/c9745ed1d9f207416be6d2e6f8de32d1f16199bf/",
)

img_model_path = os.path.join(
    root,
    "./models/clip-ViT-B-32/",  # change to your folder
)

text_model = SentenceTransformer(text_model_path)
img_model = SentenceTransformer(img_model_path)


# -------------------------------
# app + CORS
# -------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend/dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# request models
# -------------------------------


class TextReq(BaseModel):
    text: str


@app.post("/embed/text")
def embed_text(r: TextReq):
    v = text_model.encode(r.text, convert_to_numpy=True).tolist()
    return {"vector": v}


# -------------------------------
# health check
# -------------------------------


@app.get("/")
async def root_route():
    return {"status": "ok"}


class ImgReq(BaseModel):
    b64: str


@app.post("/embed/img")
def embed_img(r: ImgReq):
    raw = base64.b64decode(r.b64)
    img = Image.open(io.BytesIO(raw))
    v = img_model.encode(img, convert_to_numpy=True).tolist()
    return {"vector": v}


#
#
# # visualize data
#
# import numpy as np
# import umap
# from pydantic import BaseModel
#
#
# class VizReq(BaseModel):
#     embeddings: list[list[float]]
#
#
# @app.post("/visualize/umap")
# def visualize(req: VizReq):
#     X = np.array(req.embeddings)
#
#     if X.ndim != 2 or X.shape[0] < 2:
#         return {"error": "need >=2 embeddings"}
#
#     reducer = umap.UMAP(n_neighbors=10, min_dist=0.1, n_components=2)
#     Y = reducer.fit_transform(X)
#
#     return {"points": Y.tolist()}
#
#
# from sklearn.manifold import TSNE
#
#
# @app.post("/visualize/tsne")
# def viz_tsne(r: dict):
#     import numpy as np
#
#     X = np.array(r["vectors"])
#     Y = TSNE(n_components=2, perplexity=30).fit_transform(X)
#     return {"points": Y.tolist()}
