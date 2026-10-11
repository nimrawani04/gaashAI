"""Inspect Omarrran's Kashmiri word-recognition dataset for TTS suitability.

This dataset is useful as an auxiliary spoken-word classification corpus, but
it is not a playable voice corpus: each example contains a 70x1000 processed
feature matrix and a 12-element one-hot label. The script loads it directly
from Hugging Face and fails loudly if a future revision gains an audio column.
"""

from __future__ import annotations

import json
from collections import Counter

import numpy as np
from datasets import load_dataset


DATASET_ID = "Omarrran/kashmiri_words_dataset_restructured"
LABELS = [
    "adsa",
    "āh",
    "nov (m.)",
    "khabar",
    "be",
    "vucə",
    "na",
    "band",
    "va:ray",
    "k’ah",
    "ye:le",
    "theek",
]


def inspect() -> dict[str, object]:
    dataset = load_dataset(DATASET_ID)
    report: dict[str, object] = {
        "dataset": DATASET_ID,
        "splits": {},
        "labels": LABELS,
        "usable_for_direct_audio_output": False,
        "reason": "The dataset exposes processed features and one-hot labels, not waveform/audio fields.",
        "recommended_use": "Auxiliary spoken-word recognition/pronunciation coverage; do not reconstruct speech from these features.",
    }
    for split, rows in dataset.items():
        names = list(rows.features.keys())
        if any(name in names for name in ("audio", "waveform", "wav", "audio_path")):
            raise RuntimeError(f"Unexpected playable audio field in {split}: {names}")
        labels = np.asarray(rows["label"])
        counts = labels.argmax(axis=1)
        report["splits"][split] = {
            "rows": len(rows),
            "features": names,
            "data_shape": list(np.asarray(rows[0]["data"]).shape),
            "label_counts": dict(Counter(int(index) for index in counts)),
        }
    return report


if __name__ == "__main__":
    print(json.dumps(inspect(), ensure_ascii=False, indent=2))
