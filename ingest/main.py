
import json, requests
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

MODEL = "models/models--sentence-transformers--all-MiniLM-L6-v2/snapshots/c9745ed1d9f207416be6d2e6f8de32d1f16199bf/"
API = "http://localhost:8000/collections/startups/insert"

m = SentenceTransformer(MODEL)

def load_ndjson(path):
    out = []
    with open(path, "r") as f:
        buf = ""
        for line in f:
            line = line.rstrip("\n")
            if not line:
                continue
            buf += line
            try:
                obj = json.loads(buf)
                out.append(obj)
                buf = ""
            except json.JSONDecodeError:
                # description contains raw newlines → keep accumulating
                buf += "\n"
        return out

items = load_ndjson("./data/text/startups.jsonl")

for i, x in enumerate(tqdm(items)):
    flat = " ".join(f"{k}: {v}" for k, v in x.items() if isinstance(v, str))
    vec = m.encode(flat).tolist()

    payload = {
        "id": f"item_{i}",
        "vector": vec,
        "metadata": x,
    }

    requests.post(API, json=payload)

