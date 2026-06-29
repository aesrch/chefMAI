from fastapi import FastAPI, UploadFile, File
from PIL import Image
import torch
import clip
import io

app = FastAPI()

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

PROTEINS = [
    "chicken", "pork", "beef", "fish", "shrimp",
    "crab", "egg", "tofu"
]

VEGETABLES = [
    "onion", "garlic", "tomato", "carrot", "potato",
    "bell pepper", "cabbage", "lettuce",
    "spinach", "broccoli", "cauliflower",
    "eggplant", "cucumber", "zucchini",
    "green beans", "corn", "peas"
]

FRUITS = [
    "apple",
    "banana",
    "orange",
    "lemon",
    "lime",
    "grapefruit",
    "pear",
    "peach",
    "plum",
    "apricot",
    "mango",
    "pineapple",
    "watermelon",
    "cantaloupe",
    "honeydew",
    "kiwi",
    "strawberry",
    "raspberry",
    "blueberry",
    "blackberry",
    "cherry",
    "grape",
    "pomegranate",
    "papaya",
    "guava",
    "fig"
]




INGREDIENTS = (
    PROTEINS
    + VEGETABLES
    + FRUITS
)

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = preprocess(
        Image.open(io.BytesIO(image_bytes)).convert("RGB")
    ).unsqueeze(0).to(device)

    text = clip.tokenize(
        [f"a photo of ingredients including {i}" for i in INGREDIENTS]
    ).to(device)

    with torch.no_grad():
        logits_per_image, _ = model(image, text)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]

    results = [
        INGREDIENTS[i]
        for i, p in enumerate(probs)
        if p > 0.10
    ]

    return {
    "ingredients": [{"name": label} for label in results]
}

