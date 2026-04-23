import os, json, requests
from PIL import Image
import torch
from tqdm import tqdm
from transformers import CLIPProcessor, CLIPModel

MODEL_DIR = "./models/clip-ViT-B-32"
IMDIR = "./data/images"
BACKEND_URL = "http://localhost:8000/collections/images/insert"   # ← FIX

def embed(path, model, proc, device):
    img = Image.open(path).convert("RGB")
    inp = proc(images=img, return_tensors="pt").to(device)
    with torch.no_grad():
        v = model.get_image_features(**inp)[0]
    return v.cpu().tolist()

def main():
    device = "cuda" if torch.cuda.is_available() else "cpu"

    model = CLIPModel.from_pretrained(MODEL_DIR).to(device)
    proc = CLIPProcessor.from_pretrained(MODEL_DIR)

    files = [f for f in os.listdir(IMDIR) if f.endswith(".png")]

    for f in tqdm(files, desc="embedding"):
        p = os.path.join(IMDIR, f)
        vec = embed(p, model, proc, device)

        payload = {
            "id": f,
            "vector": vec,
            "metadata": {"filename": f},
        }
        try:
            requests.post(BACKEND_URL, json=payload)
        except:
            print("pass")


if __name__ == "__main__":
    main()

# import sys
# import json
# from PIL import Image
# import torch
# from transformers import CLIPProcessor, CLIPModel
#
# # path to your downloaded model folder (change if needed)
# MODEL_DIR = "./models/clip-ViT-B-32"
#
# def main():
#     if len(sys.argv) != 2:
#         print(json.dumps({"error": "usage: python embed_image.py path/to/img"}))
#         return
#
#     img_path = sys.argv[1]
#
#     # load model
#     model = CLIPModel.from_pretrained(MODEL_DIR)
#     processor = CLIPProcessor.from_pretrained(MODEL_DIR)
#
#     # load image
#     image = Image.open(img_path).convert("RGB")
#
#     # preprocess
#     inputs = processor(images=image, return_tensors="pt")
#
#     # encode
#     with torch.no_grad():
#         emb = model.get_image_features(**inputs)
#
#     # flatten → python list
#     vec = emb[0].cpu().tolist()
#
#     print(json.dumps({"vector": vec}))
#
# if __name__ == "__main__":
#     main()

