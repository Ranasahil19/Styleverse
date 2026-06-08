import json
import sys
from io import BytesIO

import numpy as np
import requests
from PIL import Image


VECTOR_SIZE = 1000


def extract_features(image_url):
    response = requests.get(image_url, timeout=20)
    response.raise_for_status()

    image = Image.open(BytesIO(response.content)).convert("RGB")

    # Compact, deterministic image embedding that avoids heavyweight ML deps.
    resized = image.resize((18, 18))
    pixels = np.asarray(resized, dtype=np.float32).reshape(-1) / 255.0

    channel_values = np.asarray(image.resize((64, 64)), dtype=np.float32) / 255.0
    channel_means = channel_values.mean(axis=(0, 1))
    channel_stds = channel_values.std(axis=(0, 1))

    histograms = []
    for channel in range(3):
        hist, _ = np.histogram(
            channel_values[:, :, channel],
            bins=8,
            range=(0.0, 1.0),
            density=True,
        )
        histograms.extend(hist.astype(np.float32).tolist())

    features = np.concatenate(
        [
            pixels,
            channel_means,
            channel_stds,
            np.asarray(histograms, dtype=np.float32),
        ]
    )

    if features.size < VECTOR_SIZE:
        features = np.pad(features, (0, VECTOR_SIZE - features.size))

    return features[:VECTOR_SIZE].astype(float).tolist()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("Usage: extract_features.py <image_url>")

    print(json.dumps(extract_features(sys.argv[1])))
