"""Evaluate a Kashmiri TTS checkpoint on the held-out split.

The default target is the public GAASH-Lab Matcha-TTS-Kashmiri demo.  A
deployed fine-tuned Bolbosh server can be evaluated with ``--space-url`` when
it exposes the same Gradio ``/gradio_api/call/pipeline`` endpoint, or by
pointing ``--generated-dir`` at WAVs produced by the local CLI.

The script reports:

* audio validity and duration/peak statistics;
* optional ASR-proxy WER for intelligibility;
* optional MCD against the held-out reference audio; and
* human rating averages for intelligibility, pronunciation, and naturalness.

Automatic metrics are proxies.  Kashmiri ASR is still error-prone, so a
native-speaker listening sheet is generated every time and remains the source
of truth for pronunciation and naturalness.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from statistics import mean
from typing import Any


SPACE_URL = "https://gaash-lab-matcha-tts-kashmiri-demo.hf.space"
DIACRITICS_RE = re.compile(r"[\u064b-\u065f\u0670\u06d6-\u06ed\u08d3-\u08ff]")


def read_manifest(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for index, line in enumerate(path.read_text(encoding="utf-8").splitlines()):
        if not line.strip():
            continue
        audio, speaker, text = line.split("|", 2)
        rows.append({"id": f"{index:06d}", "audio": Path(audio), "speaker": int(speaker), "text": text})
    return rows


def http_json(url: str, payload: dict[str, Any] | None = None) -> Any:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"} if body is not None else {},
        method="POST" if body is not None else "GET",
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_bytes(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=180) as response:
        return response.read()


def call_matcha_space(base_url: str, text: str, voice: str) -> bytes:
    base = base_url.rstrip("/")
    started = http_json(
        f"{base}/gradio_api/call/pipeline",
        {"data": [text, False, voice, "Medium"]},
    )
    event_id = started.get("event_id")
    if not event_id:
        raise RuntimeError(f"Space did not return an event id: {started}")

    request = urllib.request.Request(f"{base}/gradio_api/call/pipeline/{event_id}")
    with urllib.request.urlopen(request, timeout=300) as response:
        stream = response.read().decode("utf-8")
    complete = re.search(r"event:\s*complete\s*\ndata:\s*(.+)", stream)
    if not complete:
        raise RuntimeError(f"Space did not complete synthesis: {stream[-500:]}")
    output = json.loads(complete.group(1))
    file_info = output[1] if isinstance(output, list) and len(output) > 1 else None
    if not isinstance(file_info, dict):
        raise RuntimeError(f"Space returned no audio file: {output}")
    url = file_info.get("url")
    if not url and file_info.get("path"):
        url = f"{base}/gradio_api/file={urllib.parse.quote(str(file_info['path']))}"
    if not url:
        raise RuntimeError(f"Space returned an unusable audio file: {file_info}")
    return fetch_bytes(str(url))


def word_error_rate(reference: str, hypothesis: str) -> float:
    ref = reference.split()
    hyp = hypothesis.split()
    if not ref:
        return 0.0 if not hyp else 1.0
    previous = list(range(len(hyp) + 1))
    for i, ref_word in enumerate(ref, start=1):
        current = [i]
        for j, hyp_word in enumerate(hyp, start=1):
            current.append(
                min(
                    current[-1] + 1,
                    previous[j] + 1,
                    previous[j - 1] + (ref_word != hyp_word),
                )
            )
        previous = current
    return previous[-1] / len(ref)


def speech_stats(path: Path) -> dict[str, float | int | bool]:
    import numpy as np
    import soundfile as sf

    samples, sample_rate = sf.read(path, dtype="float32", always_2d=True)
    mono = samples.mean(axis=1)
    return {
        "sample_rate": int(sample_rate),
        "seconds": round(float(len(mono) / sample_rate), 3),
        "rms": round(float(np.sqrt(np.mean(np.square(mono)))), 5),
        "peak": round(float(np.max(np.abs(mono))), 5),
        "clipped": bool(np.any(np.abs(mono) >= 0.999)),
    }


def mel_cepstral_distortion(reference: Path, generated: Path) -> float | None:
    try:
        import librosa
        import numpy as np
    except ImportError:
        return None
    try:
        ref, sr = librosa.load(reference, sr=22050, mono=True)
        hyp, _ = librosa.load(generated, sr=22050, mono=True)
        ref_mfcc = librosa.feature.mfcc(y=ref, sr=sr, n_mfcc=24, n_fft=1024, hop_length=256)[1:]
        hyp_mfcc = librosa.feature.mfcc(y=hyp, sr=sr, n_mfcc=24, n_fft=1024, hop_length=256)[1:]
        _, path = librosa.sequence.dtw(X=ref_mfcc, Y=hyp_mfcc, metric="euclidean")
        aligned_ref = ref_mfcc[:, path[:, 0]]
        aligned_hyp = hyp_mfcc[:, path[:, 1]]
        distances = np.sqrt(np.sum(np.square(aligned_ref - aligned_hyp), axis=0))
        return round(float(10.0 / np.log(10.0) * np.sqrt(2.0) * np.mean(distances)), 4)
    except Exception:
        return None


def run_asr(paths: list[Path], model_id: str) -> list[str] | None:
    if not model_id:
        return None
    try:
        from transformers import pipeline
    except ImportError:
        print("ASR skipped: install transformers to use --asr-model", file=sys.stderr)
        return None
    try:
        recognizer = pipeline("automatic-speech-recognition", model=model_id)
        return [str(recognizer(str(path))["text"]) for path in paths]
    except Exception as exc:
        print(f"ASR skipped: {exc}", file=sys.stderr)
        return None


def write_rating_template(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["id", "audio", "transcript", "intelligibility_1_5", "pronunciation_1_5", "naturalness_1_5", "comments"],
        )
        writer.writeheader()
        for row in rows:
            writer.writerow({"id": row["id"], "audio": row["generated_audio"], "transcript": row["text"]})


def read_human_ratings(path: Path) -> dict[str, float] | None:
    if not path.is_file():
        return None
    fields = ("intelligibility_1_5", "pronunciation_1_5", "naturalness_1_5")
    values: dict[str, list[float]] = {field: [] for field in fields}
    with path.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            for field in fields:
                try:
                    value = float(row.get(field, ""))
                    if 1 <= value <= 5:
                        values[field].append(value)
                except ValueError:
                    continue
    return {field: round(mean(items), 3) for field, items in values.items() if items}


def main(args: argparse.Namespace) -> dict[str, Any]:
    manifest = Path(args.manifest).resolve()
    rows = read_manifest(manifest)
    if args.limit:
        rows = rows[: args.limit]
    if not rows:
        raise SystemExit(f"No rows found in {manifest}")

    generated_dir = Path(args.generated_dir).resolve()
    generated_dir.mkdir(parents=True, exist_ok=True)
    file_label = re.sub(r"[^A-Za-z0-9._-]+", "_", args.label).strip("_") or "checkpoint"
    output_rows: list[dict[str, Any]] = []
    generated_paths: list[Path] = []
    for index, row in enumerate(rows):
        output_path = generated_dir / f"{file_label}_{index:04d}.wav"
        if not output_path.is_file() and not args.no_synthesis:
            audio_bytes = call_matcha_space(args.space_url, row["text"], args.voice)
            output_path.write_bytes(audio_bytes)
        if not output_path.is_file():
            print(f"skip {row['id']}: missing {output_path}", file=sys.stderr)
            continue
        row = {
            **row,
            "audio": str(row["audio"]),
            "generated_audio": str(output_path),
            "stats": speech_stats(output_path),
        }
        row["mfcc_dtw_distance"] = mel_cepstral_distortion(row["audio"], output_path)
        output_rows.append(row)
        generated_paths.append(output_path)
        print(f"evaluated {index + 1}/{len(rows)}: {output_path.name}", flush=True)

    rating_template = Path(args.rating_template).resolve()
    write_rating_template(rating_template, output_rows)
    report: dict[str, Any] = {
        "checkpoint": args.label,
        "checkpoint_reference": args.space_url,
        "manifest": str(manifest),
        "evaluated_rows": len(output_rows),
        "audio": output_rows,
        "rating_template": str(rating_template),
        "human_ratings": read_human_ratings(Path(args.ratings).resolve()) if args.ratings else None,
        "metrics": {
            "mfcc_dtw_distance_note": "lower is better; this MFCC proxy is not directly comparable to the Bolbosh paper's WORLD MCD; omitted when librosa is unavailable",
            "intelligibility_note": "WER is only reported when an ASR proxy is supplied; native-speaker ratings are preferred",
            "pronunciation_note": "rate Kashmiri vowels/diacritics and consonants against the displayed transcript",
            "naturalness_note": "rate rhythm, pauses, prosody, and voice quality from 1 (poor) to 5 (excellent)",
        },
    }

    hypotheses = run_asr(generated_paths, args.asr_model)
    if hypotheses is not None:
        wers = []
        for row, hypothesis in zip(output_rows, hypotheses):
            score = word_error_rate(row["text"], hypothesis)
            row["asr_transcript"] = hypothesis
            row["asr_wer"] = round(score, 4)
            wers.append(score)
        report["metrics"]["asr_wer_mean"] = round(mean(wers), 4) if wers else None

    report_path = Path(args.report).resolve()
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(report_path), "rating_template": str(rating_template), "evaluated_rows": len(output_rows)}, indent=2))
    return report


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", default="artifacts/kashmiri-tts/manifests/test.txt")
    parser.add_argument("--generated-dir", default="artifacts/kashmiri-evaluation/baseline")
    parser.add_argument("--report", default="artifacts/kashmiri-evaluation/baseline/report.json")
    parser.add_argument("--rating-template", default="artifacts/kashmiri-evaluation/baseline/ratings.csv")
    parser.add_argument("--ratings", default="")
    parser.add_argument("--space-url", default=SPACE_URL)
    parser.add_argument("--label", default="GAASH-Lab/Matcha-TTS-Kashmiri")
    parser.add_argument("--voice", choices=("Male", "Female"), default="Male")
    parser.add_argument("--asr-model", default="", help="Optional Hugging Face ASR model for proxy WER")
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--no-synthesis", action="store_true")
    return parser.parse_args()


if __name__ == "__main__":
    main(parse_args())
