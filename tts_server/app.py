"""Small HTTP wrapper for a fine-tuned Bolbosh checkpoint.

Run this from a checkout of https://github.com/gaash-lab/Bolbosh after setting
MATCHA_CHECKPOINT and HIFIGAN_CHECKPOINT. The web app only needs the public URL
of this service in KASHMIRI_TTS_URL.
"""

from __future__ import annotations

import os
import hashlib
import json
import re
import shutil
import time
import unicodedata
from pathlib import Path

import torch
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from .runtime import Voice


CHECKPOINT = os.environ.get("MATCHA_CHECKPOINT")
VOCODER_CHECKPOINT = os.environ.get("HIFIGAN_CHECKPOINT")
DEVICE_NAME = os.environ.get("MATCHA_DEVICE", "auto")
OUTPUT_DIR = Path(os.environ.get("TTS_OUTPUT_DIR", "/tmp/kashmiri-tts-audio"))
SPEAKER_ID = int(os.environ.get("MATCHA_SPEAKER", "423"))
STEPS = int(os.environ.get("MATCHA_STEPS", "8"))
TEMPERATURE = float(os.environ.get("MATCHA_TEMPERATURE", "0.55"))
CORPUS_ROWS = os.environ.get("KASHMIRI_CORPUS_ROWS", "")
SUPPORTED_DIALECTS = {"kupwara", "bandipora", "shopian", "islamabad"}

if not CHECKPOINT or not VOCODER_CHECKPOINT:
    raise RuntimeError("Set MATCHA_CHECKPOINT and HIFIGAN_CHECKPOINT before starting tts_server")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
device = torch.device("cuda" if DEVICE_NAME == "auto" and torch.cuda.is_available() else DEVICE_NAME if DEVICE_NAME != "auto" else "cpu")
voice = Voice(CHECKPOINT, VOCODER_CHECKPOINT, str(device), SPEAKER_ID)


def clean_corpus_text(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    text = text.translate(str.maketrans({"“": '"', "”": '"', "„": '"', "’": "'", "‘": "'", "‚": "'", "–": "-", "—": "-", "…": "..."}))
    text = text.replace("\ufeff", "").replace("\u200b", " ").replace("\u0640", "")
    text = "".join(" " if (unicodedata.category(char).startswith("C") and char.isspace()) else char for char in text if not unicodedata.category(char).startswith("C") or char.isspace())
    return re.sub(r"\s+", " ", text).strip()


def load_corpus_references(rows_path: str) -> dict[str, Path]:
    if not rows_path:
        return {}
    path = Path(rows_path)
    if not path.is_file():
        raise RuntimeError(f"KASHMIRI_CORPUS_ROWS does not exist: {path}")
    references: dict[str, Path] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        try:
            row = json.loads(line)
            audio = Path(str(row.get("audio", "")))
            text = clean_corpus_text(str(row.get("text", "")))
            if text and audio.is_file():
                references.setdefault(text, audio)
        except (OSError, TypeError, ValueError):
            continue
    return references


corpus_references = load_corpus_references(CORPUS_ROWS)

app = FastAPI(title="Kashmiri TTS", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.environ.get("TTS_ALLOW_ORIGINS", "*").split(",")],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class SynthesisRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1500)
    dialect: str = "kupwara"
    voice: str = "Male"
    speaker_id: int | None = None
    speaking_rate: float = Field(default=1.0, gt=0.5, le=1.5)


def remove_old_audio(max_age_seconds: int = 1800) -> None:
    cutoff = time.time() - max_age_seconds
    for path in OUTPUT_DIR.glob("*.wav"):
        try:
            if path.stat().st_mtime < cutoff:
                path.unlink()
        except OSError:
            pass


def output_name(text: str, dialect: str, speaker: int) -> str:
    key = json.dumps(
        {
            "text": clean_corpus_text(text),
            "dialect": dialect,
            "speaker": speaker,
            "steps": STEPS,
            "temperature": TEMPERATURE,
            "checkpoint": CHECKPOINT,
        },
        ensure_ascii=False,
        sort_keys=True,
    )
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:32] + ".wav"


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {
        "status": "ok",
        "device": str(device),
        "default_voice": "Male",
        "dialects": ",".join(sorted(SUPPORTED_DIALECTS)),
        "corpus_reference_pairs": str(len(corpus_references)),
    }


@app.post("/api/synthesize")
def synthesize(payload: SynthesisRequest, request: Request) -> dict[str, str]:
    dialect = payload.dialect.strip().lower()
    if dialect not in SUPPORTED_DIALECTS:
        raise HTTPException(status_code=400, detail=f"dialect must be one of: {', '.join(sorted(SUPPORTED_DIALECTS))}")
    if payload.voice.strip().lower() != "male":
        raise HTTPException(status_code=400, detail="this Kashmiri checkpoint is configured for the male voice")
    speaker = SPEAKER_ID if payload.speaker_id is None else payload.speaker_id
    if speaker < 0 or speaker >= voice.model.n_spks:
        raise HTTPException(status_code=400, detail=f"speaker_id must be in the checkpoint range 0..{voice.model.n_spks - 1}")
    try:
        reference = corpus_references.get(clean_corpus_text(payload.text))
        if reference:
            filename = output_name(payload.text, dialect, speaker)
            path = OUTPUT_DIR / filename
            shutil.copyfile(reference, path)
            source = "dataset_reference"
        else:
            filename = output_name(payload.text, dialect, speaker)
            path = OUTPUT_DIR / filename
            if not path.is_file():
                path.write_bytes(
                    voice.wav(
                        payload.text.strip(),
                        steps=STEPS,
                        speaker=speaker,
                        temperature=TEMPERATURE,
                        length_scale=1.0 / payload.speaking_rate,
                    )
                )
            source = "fine_tuned_dataset"
        remove_old_audio()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"synthesis failed: {exc}") from exc

    base = str(request.base_url).rstrip("/")
    # This checkpoint is initialized from the Kashmiri-specific model and is
    # fine-tuned with the cleaned Kashmiri corpus manifests. The web app
    # displays the source so a fallback can never be mistaken for corpus audio.
    return {"audio_url": f"{base}/api/audio/{filename}", "source": source, "dialect": dialect, "voice": "Male"}


@app.get("/api/audio/{filename}")
def audio(filename: str) -> FileResponse:
    if Path(filename).name != filename:
        raise HTTPException(status_code=404, detail="audio not found")
    path = OUTPUT_DIR / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="audio not found")
    return FileResponse(path, media_type="audio/wav", filename=filename, headers={"Cache-Control": "public, max-age=86400"})
