"""Download, validate, normalize, and split the Kashmiri audio corpus.

The corpus is deliberately loaded from Hugging Face at run time.  Audio is
written to a local training workspace only; no dataset audio is checked into
the web application.

Example:
    python scripts/prepare_kashmiri_tts.py --output-dir artifacts/kashmiri-tts

The generated file lists use the format expected by the Bolbosh/Matcha-TTS
training code:

    absolute_audio_path|speaker_id|cleaned_kashmiri_transcript
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any, Iterable


DATASET_ID = "programindz/kashmiri-audio-corpus"
DATASET_REVISION = "cd0b1408bf2757f7fefc5832a6c12cbc61abc627"
MENDELEY_KTTS_URL = "https://data.mendeley.com/datasets/5c4dcvxdmb/2"
KAGGLE_VOICE_URL = "https://www.kaggle.com/datasets/umar1103/converteddatanew"
TARGET_SAMPLE_RATE = 22_050
EXPECTED_SOURCE_SAMPLE_RATES = {16_000, 48_000}

# These are the characters that carry Kashmiri/Perso-Arabic pronunciation
# information in this corpus.  In particular, do not use NFKC or ASCII
# transliteration here: NFKC can fold presentation forms and transliteration
# drops the vowel marks that make Kashmiri distinguishable.
CANONICAL_CHARACTERS = str.maketrans(
    {
        "“": '"',
        "”": '"',
        "„": '"',
        "’": "'",
        "‘": "'",
        "‚": "'",
        "–": "-",
        "—": "-",
        "…": "...",
    }
)

ARABIC_SCRIPT_RE = re.compile(r"[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]")
WHITESPACE_RE = re.compile(r"\s+")


def clean_transcript(raw: str) -> str:
    """Normalize a transcript without removing pronunciation cues.

    The cleaner intentionally keeps Arabic combining marks (fatha, damma,
    kasra, hamza marks, superscript alef, and Kashmiri vowel marks), Arabic
    punctuation, Latin words used for names/acronyms, and both ASCII and
    Perso-Arabic digits.  It removes only formatting/control noise and the
    tatweel glyph, which is a visual elongation rather than a sound.
    """

    text = unicodedata.normalize("NFC", raw).translate(CANONICAL_CHARACTERS)
    text = text.replace("\ufeff", "").replace("\u200b", " ")
    text = text.replace("\u0640", "")  # tatweel/kashida: visual, not phonetic

    kept: list[str] = []
    for char in text:
        category = unicodedata.category(char)
        if char in "\u200c\u200d":
            kept.append(char)  # preserve word joining semantics
        elif category.startswith("C"):
            # Preserve ordinary whitespace; discard all other controls.
            if char.isspace():
                kept.append(" ")
            continue
        elif category.startswith(("L", "M", "N", "P")) or char in "+=/&%":
            kept.append(char)
        elif char.isspace():
            kept.append(" ")

    return WHITESPACE_RE.sub(" ", "".join(kept)).strip()


def recording_id(source_name: str) -> str:
    """OpenSLR export appends _<segment index>.wav to recording names."""
    return re.sub(r"_\d+$", "", Path(source_name).stem)


def assign_splits(rows: list[dict[str, Any]], seed: int) -> None:
    # Union recordings that share a transcript: neither source recordings nor
    # duplicate prompts should leak across holdouts. Speaker identity is not
    # available, so these are recording-disjoint, not claimed speaker-disjoint.
    parent = {r["recording_id"]: r["recording_id"] for r in rows}

    def root(key: str) -> str:
        while parent[key] != key:
            parent[key] = parent[parent[key]]
            key = parent[key]
        return key

    text_recording: dict[str, str] = {}
    for row in rows:
        key = row["recording_id"]
        previous = text_recording.setdefault(row["text"], key)
        a, b = sorted((root(key), root(previous)))
        parent[b] = a
    groups: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        group = root(row["recording_id"])
        row["split_group"] = group
        groups.setdefault(group, []).append(row)

    # Assign whole recordings/duplicate-text groups to the split with the
    # largest remaining target. This preserves group isolation while keeping
    # small corpora close to 80/10/10 (a hash-per-row split can be very skewed
    # when there are only a few source recordings).
    targets = {"train": len(rows) * 0.8, "validation": len(rows) * 0.1, "test": len(rows) * 0.1}
    counts = {key: 0 for key in targets}
    ordered_groups = sorted(
        groups.items(),
        key=lambda item: hashlib.sha256(f"{seed}:{item[0]}".encode("utf-8")).hexdigest(),
    )
    for group, group_rows in ordered_groups:
        size = len(group_rows)
        split = max(targets, key=lambda key: targets[key] - counts[key])
        for row in group_rows:
            row["split"] = split
        counts[split] += size


def read_audio(audio: dict[str, Any]) -> tuple[Any, int, bytes]:
    """Decode a datasets Audio(decode=False) value with soundfile."""

    try:
        import soundfile as sf
    except ImportError as exc:  # pragma: no cover - dependency guidance
        raise RuntimeError("Install soundfile before preparing the corpus") from exc

    encoded = audio.get("bytes")
    if encoded is None:
        path = audio.get("path")
        if not path:
            raise ValueError("audio has neither bytes nor path")
        encoded = Path(path).read_bytes()
    samples, sample_rate = sf.read(io.BytesIO(encoded), dtype="float32", always_2d=True)
    return samples, int(sample_rate), encoded


def resample_mono(samples: Any, sample_rate: int) -> Any:
    import numpy as np
    from scipy.signal import resample_poly

    mono = samples.mean(axis=1) if samples.ndim == 2 else samples
    if sample_rate != TARGET_SAMPLE_RATE:
        mono = resample_poly(mono, TARGET_SAMPLE_RATE, sample_rate)
    return np.asarray(mono, dtype="float32")


def iter_rows(dataset_id: str, revision: str) -> Iterable[dict[str, Any]]:
    try:
        from datasets import Audio, load_dataset
    except ImportError as exc:  # pragma: no cover - dependency guidance
        raise RuntimeError("Install datasets before preparing the corpus") from exc

    # Streaming keeps the initial metadata operation light and still reads
    # every encoded WAV once while exporting the local training workspace.
    dataset = load_dataset(dataset_id, revision=revision, split="train", streaming=True)
    dataset = dataset.cast_column("audio", Audio(decode=False))
    yield from dataset


def iter_mendeley_rows(root: Path) -> Iterable[dict[str, Any]]:
    """Yield rows from a downloaded KTTS Single Speaker Dataset folder.

    Mendeley hosts the archive behind its download UI, so the script consumes a
    local extraction containing `Recordings` and `Text Files/textcorpus.csv`.
    """

    recordings = root / "Recordings"
    text_files = root / "Text Files"
    csv_path = text_files / "textcorpus.csv"
    if not csv_path.is_file():
        csv_path = next(root.rglob("textcorpus.csv"), None)
    if not csv_path or not csv_path.is_file():
        raise ValueError(f"Could not find textcorpus.csv under {root}")
    if not recordings.is_dir():
        recordings = csv_path.parents[1] / "Recordings" if len(csv_path.parents) > 1 else recordings
    if not recordings.is_dir():
        raise ValueError(f"Could not find Recordings folder under {root}")

    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            row_id = str(row.get("id") or "").strip()
            sentence = str(row.get("sentence") or row.get("text") or "").strip()
            if not row_id:
                continue
            wav = recordings / f"{row_id}.wav"
            yield {"text": sentence, "audio": {"path": str(wav)}, "duration": 0, "source_dataset": "mendeley-ktts"}


def find_text_column(row: dict[str, str]) -> str:
    for name in ("sentence", "text", "transcript", "kashmiri", "ks", "label"):
        value = str(row.get(name) or "").strip()
        if value:
            return value
    return ""


def find_audio_path(row: dict[str, str], root: Path, audio_dir: Path) -> Path | None:
    for name in ("audio", "audio_path", "wav", "path", "file", "filename"):
        value = str(row.get(name) or "").strip()
        if not value:
            continue
        candidate = Path(value)
        if candidate.is_absolute() and candidate.is_file():
            return candidate
        for base in (audio_dir, root):
            resolved = base / value
            if resolved.is_file():
                return resolved
            if resolved.suffix.lower() != ".wav" and resolved.with_suffix(".wav").is_file():
                return resolved.with_suffix(".wav")

    row_id = str(row.get("id") or row.get("utt_id") or row.get("audio_id") or "").strip()
    if row_id:
        for base in (audio_dir, root):
            candidate = base / f"{row_id}.wav"
            if candidate.is_file():
                return candidate
    return None


def iter_local_csv_rows(root: Path, source_dataset: str) -> Iterable[dict[str, Any]]:
    csv_files = sorted(root.rglob("*.csv"))
    if not csv_files:
        raise ValueError(f"Could not find any CSV metadata under {root}")
    audio_dir = next((p for p in root.rglob("*") if p.is_dir() and p.name.lower() in {"recordings", "wavs", "audio"}), root)
    for csv_path in csv_files:
        with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                text = find_text_column(row)
                wav = find_audio_path(row, root, audio_dir)
                if text and wav:
                    yield {"text": text, "audio": {"path": str(wav)}, "duration": 0, "source_dataset": source_dataset}


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def prepare(args: argparse.Namespace) -> dict[str, Any]:
    import numpy as np
    import soundfile as sf

    output_dir = Path(args.output_dir).resolve()
    wav_dir = output_dir / "wavs"
    manifest_dir = output_dir / "manifests"
    wav_dir.mkdir(parents=True, exist_ok=True)
    manifest_dir.mkdir(parents=True, exist_ok=True)

    json_rows: list[dict[str, Any]] = []
    rejected: list[dict[str, Any]] = []
    reasons: Counter[str] = Counter()
    warnings: Counter[str] = Counter()
    seen_audio: set[str] = set()
    source_count = 0
    valid_count = 0
    total_seconds = 0.0

    if args.mendeley_dir:
        source_rows = iter_mendeley_rows(Path(args.mendeley_dir).resolve())
        dataset_label = MENDELEY_KTTS_URL
        dataset_revision = "2"
    elif args.local_csv_dir:
        source_rows = iter_local_csv_rows(Path(args.local_csv_dir).resolve(), args.local_source_name)
        dataset_label = args.local_source_url or args.local_source_name
        dataset_revision = "local"
    else:
        source_rows = iter_rows(args.dataset, args.revision)
        dataset_label = args.dataset
        dataset_revision = args.revision

    for index, row in enumerate(source_rows):
        if args.limit and index >= args.limit:
            break
        source_count += 1
        text_raw = str(row.get("text") or "")
        text = clean_transcript(text_raw)
        if not text:
            reasons["empty_transcript"] += 1
            continue
        if not ARABIC_SCRIPT_RE.search(text):
            reasons["no_perso_arabic_script"] += 1
            continue

        audio = row.get("audio")
        if not isinstance(audio, dict):
            reasons["missing_audio"] += 1
            continue
        try:
            samples, sample_rate, encoded = read_audio(audio)
            if sample_rate not in EXPECTED_SOURCE_SAMPLE_RATES:
                warnings[f"unexpected_sample_rate_{sample_rate}"] += 1
            if samples.size == 0:
                raise ValueError("empty waveform")
            if not np.isfinite(samples).all():
                raise ValueError("non-finite waveform")
            peak = float(np.max(np.abs(samples)))
            if peak > 1.05:
                raise ValueError(f"waveform peak {peak:.3f} exceeds PCM range")
            measured_seconds = float(samples.shape[0] / sample_rate)
            if not args.min_seconds <= measured_seconds <= args.max_seconds:
                raise ValueError("duration_outside_training_range")
            rms = float(np.sqrt(np.mean(samples ** 2)))
            if rms < 0.001:
                raise ValueError("silent_or_extremely_quiet_audio")
            clipped_fraction = float(np.mean(np.abs(samples) >= 0.999))
            if clipped_fraction > 0.01:
                raise ValueError("heavily_clipped_audio")
            letters = sum(unicodedata.category(c).startswith("L") for c in text)
            if not 1 <= letters / measured_seconds <= 35:
                raise ValueError("implausible_transcript_audio_ratio")
            declared_seconds = float(row.get("duration") or 0)
            if declared_seconds > 0 and abs(measured_seconds - declared_seconds) > max(0.15, declared_seconds * 0.05):
                raise ValueError(f"duration mismatch ({measured_seconds:.3f}s vs {declared_seconds:.3f}s)")
        except Exception as exc:  # keep the report actionable and continue
            reasons[f"audio_error:{str(exc)[:100]}"] += 1
            rejected.append({"source_row": index, "source_name": audio.get("path"), "text": text, "reason": str(exc)})
            continue

        audio_sha = hashlib.sha256(encoded).hexdigest()
        if audio_sha in seen_audio:
            reasons["duplicate_audio"] += 1
            continue
        seen_audio.add(audio_sha)

        source_name = str(audio.get("path") or f"row-{source_count}")
        row_id = f"{valid_count:06d}"
        output_path = wav_dir / f"{row_id}.wav"
        normalized_audio = resample_mono(samples, sample_rate)
        sf.write(output_path, normalized_audio, TARGET_SAMPLE_RATE, subtype="PCM_16")

        json_rows.append(
            {
                "id": row_id,
                "source_name": source_name,
                "source_dataset": str(row.get("source_dataset") or dataset_label),
                "audio_sha256": audio_sha,
                "audio": output_path.as_posix(),
                "recording_id": recording_id(source_name),
                "text_original": text_raw,
                "text": text,
                "source_sample_rate": sample_rate,
                "target_sample_rate": TARGET_SAMPLE_RATE,
                "duration": round(float(normalized_audio.shape[0] / TARGET_SAMPLE_RATE), 4),
                "rms": round(rms, 6),
                "clipped_fraction": round(clipped_fraction, 6),
                "alignment_review": "pending_native_listener",
            }
        )
        valid_count += 1
        total_seconds += measured_seconds

        if args.progress and (source_count == 1 or source_count % args.progress == 0):
            print(f"processed={source_count} valid={valid_count}", flush=True)

    assign_splits(json_rows, args.seed)
    # Mendeley KTTS is a single male speaker corpus. Other corpora may expose
    # no speaker IDs, so keep deterministic recording proxies for them.
    recording_slots = {key: 0 for key in {r['recording_id'] for r in json_rows}}
    if not args.mendeley_dir:
        recording_slots = {key: i for i, key in enumerate(sorted(recording_slots))}
    split_rows: dict[str, list[str]] = {"train": [], "validation": [], "test": []}
    for row in json_rows:
        row['speaker_id'] = recording_slots[row['recording_id']]
        split_rows[row['split']].append(f"{row['audio']}|{row['speaker_id']}|{row['text'].replace('|', ' ')}")
    for split, rows in split_rows.items():
        path = manifest_dir / f"{split}.txt"
        path.write_text("\n".join(rows) + ("\n" if rows else ""), encoding="utf-8")

    split_counts = {key: len(value) for key, value in split_rows.items()}
    report = {
        "dataset": dataset_label,
        "revision": dataset_revision,
        "source_split": "train",
        "source_rows_seen": source_count,
        "valid_rows": valid_count,
        "rejected_rows": source_count - valid_count,
        "rejection_reasons": dict(reasons),
        "split_counts": split_counts,
        "total_audio_hours": round(total_seconds / 3600, 3),
        "sample_rate_hz": TARGET_SAMPLE_RATE,
        "speaker_policy": "single verified male speaker for Mendeley KTTS; otherwise recording proxy IDs in the existing 424-speaker range",
        "recording_count": len(recording_slots),
        "split_group_count": len({r['split_group'] for r in json_rows}),
        "warnings": dict(warnings),
        "n_spks": 424,
        "duration_limits": [args.min_seconds, args.max_seconds],
        "alignment_review": "structural checks only; native listening review pending",
        "seed": args.seed,
        "transcript_policy": "NFC and whitespace/punctuation cleanup; preserve letters, combining marks, joining characters and digits",
    }
    write_json(output_dir / "metadata.json", report)
    write_json(output_dir / "rejected.json", rejected)
    with (output_dir / "rows.jsonl").open("w", encoding="utf-8") as handle:
        for row in json_rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")

    # This is consumed by the Bolbosh config when the fine-tuning helper is
    # pointed at the generated workspace.
    write_json(output_dir / "vocabulary_audit.json", vocabulary_audit([r["text"] for r in json_rows]))
    return report


def vocabulary_audit(texts: list[str]) -> dict[str, Any]:
    characters = Counter(char for text in texts for char in text if not char.isspace())
    return {
        "unique_characters": len(characters),
        "characters": {char: count for char, count in sorted(characters.items(), key=lambda item: ord(item[0]))},
        "unusual_controls": [char for char in characters if unicodedata.category(char).startswith("C")],
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", default=DATASET_ID)
    parser.add_argument("--revision", default=DATASET_REVISION)
    parser.add_argument("--mendeley-dir", default="", help="Path to an extracted KTTS Single Speaker Dataset download")
    parser.add_argument("--local-csv-dir", default="", help="Path to a local corpus with CSV metadata and WAV files")
    parser.add_argument("--local-source-name", default="local-kashmiri-voice-corpus")
    parser.add_argument("--local-source-url", default="")
    parser.add_argument("--output-dir", default="artifacts/kashmiri-tts")
    parser.add_argument("--seed", type=int, default=20261011)
    parser.add_argument("--limit", type=int, default=0, help="Rows to inspect/export; 0 means the complete corpus")
    parser.add_argument("--progress", type=int, default=100, help="Print progress every N source rows; 0 disables it")
    parser.add_argument("--min-seconds", type=float, default=0.7)
    parser.add_argument("--max-seconds", type=float, default=15.0)
    return parser.parse_args()


if __name__ == "__main__":
    try:
        result = prepare(parse_args())
    except Exception as exc:
        print(f"prepare_kashmiri_tts: {exc}", file=sys.stderr)
        raise
    print(json.dumps(result, ensure_ascii=False, indent=2))
