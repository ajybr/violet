
import sys, json, os
from sentence_transformers import SentenceTransformer

root = os.path.dirname(__file__)
model_path = os.path.join(
    root,
    "models/models--sentence-transformers--all-MiniLM-L6-v2/snapshots/c9745ed1d9f207416be6d2e6f8de32d1f16199bf/",
)

m = SentenceTransformer(model_path)

j = json.loads(sys.stdin.read())
v = m.encode(j["text"], convert_to_numpy=True).tolist()
print(json.dumps(v), end="")

# m = SentenceTransformer(
#     "models/models--sentence-transformers--all-MiniLM-L6-v2/snapshots/c9745ed1d9f207416be6d2e6f8de32d1f16199bf/"
# )
# def embed_query(text):
#     v = m.encode(text, convert_to_numpy=True).tolist()
#     return v

