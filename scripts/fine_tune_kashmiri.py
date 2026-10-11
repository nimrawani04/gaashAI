"""Fine-tune GAASH-Lab's Kashmiri Matcha checkpoint; keep holdout text/audio isolated.

Requires the pinned external Bolbosh checkout on PYTHONPATH. The checkpoint
stores the conservative text cleaner version and expanded vocabulary, shared
with tts_server.runtime. No character or speaker embeddings are overwritten.
"""
from __future__ import annotations

import argparse
import functools
import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
BASE_REPO = "GAASH-Lab/Matcha-TTS-Kashmiri"
BASE_REVISION = "718203e01e0b4ddab3e925445619c69cddeb7231"


def main(args):
    sys.path.insert(0, str(Path(args.bolbosh_dir).resolve()))
    import numpy as np
    import soundfile as sf
    import torch
    from torch.utils.data import DataLoader, Dataset
    from huggingface_hub import hf_hub_download
    from tts_server.runtime import load_model, encode_text
    from scripts.prepare_kashmiri_tts import clean_transcript

    torch.manual_seed(args.seed)
    torch.set_num_threads(4)
    np.random.seed(args.seed)
    data_dir, output = Path(args.data_dir).resolve(), Path(args.output_dir).resolve()
    rows = [json.loads(line) for line in (data_dir / "rows.jsonl").read_text(encoding="utf-8").splitlines()]
    train = [r for r in rows if r["split"] == "train"]
    val = [r for r in rows if r["split"] == "validation"]
    if not train or not val:
        raise ValueError("Non-empty training and validation splits required")
    if {r['split_group'] for r in train} & {r['split_group'] for r in val}:
        raise ValueError("Recording leakage between splits")
    checkpoint = args.base_checkpoint or hf_hub_download(BASE_REPO, "model.ckpt", revision=BASE_REVISION, cache_dir=args.checkpoint_cache)
    model, _ = load_model(checkpoint)
    from matcha.text.symbols import symbols
    from matcha.utils.audio import mel_spectrogram
    from matcha.data.text_mel_datamodule import TextMelBatchCollate

    # Only train text determines additional symbols. Holdout OOVs are reported,
    # never silently dropped or used to design the train-time vocabulary.
    extra = sorted({c for r in train for c in clean_transcript(r['text'])} - set(symbols))
    all_symbols = list(symbols) + extra
    train_recordings = sorted({r['recording_id'] for r in train})
    speaker_map = {key: model.n_spks + i for i, key in enumerate(train_recordings)}
    original_speakers = model.n_spks
    metadata = {
        "base_repo": BASE_REPO, "base_revision": BASE_REVISION,
        "dataset": rows[0].get("source_dataset", "programindz/kashmiri-audio-corpus") if rows else "unknown",
        "dataset_revision": "mendeley-v2-or-pinned-hf",
        "cleaner": "conservative_nfc_v1", "symbols": all_symbols,
        "speaker_map": speaker_map, "speaker_policy": "unverified recording proxies",
        "default_speaker": speaker_map[max(train_recordings, key=lambda k: sum(r['recording_id'] == k for r in train))],
        "seed": args.seed,
        "rows_sha256": hashlib.sha256((data_dir / 'rows.jsonl').read_bytes()).hexdigest(),
    }
    # Expand embeddings while retaining every pretrained row at its original ID.
    old = model.encoder.emb
    expanded = torch.nn.Embedding(len(all_symbols), old.embedding_dim)
    with torch.no_grad():
        expanded.weight[:len(symbols)] = old.weight
        expanded.weight[len(symbols):] = old.weight.mean(0)
    model.encoder.emb = expanded
    model.n_vocab = model.hparams.n_vocab = len(all_symbols)
    old = model.spk_emb
    expanded = torch.nn.Embedding(original_speakers + len(speaker_map), old.embedding_dim)
    with torch.no_grad():
        expanded.weight[:original_speakers] = old.weight
        expanded.weight[original_speakers:] = old.weight.mean(0)
    model.spk_emb = expanded
    model.n_spks = model.hparams.n_spks = expanded.num_embeddings
    segment_frames = 64  # decoder crop; must be divisible by Bolbosh's downsamplers
    model.out_size = model.hparams.out_size = segment_frames
    model.hparams.optimizer = functools.partial(torch.optim.Adam, lr=args.learning_rate)

    class Pairs(Dataset):
        def __init__(self, examples, heldout=False):
            self.examples = []
            self.rejected = []
            self.cache = {}
            for row in examples:
                try:
                    x = encode_text(row['text'], metadata)
                    # MAS requires at least one mel frame per interspersed token.
                    frame_count = int(row['duration'] * 22050 / 256)
                    if frame_count < segment_frames:
                        raise ValueError("audio_shorter_than_training_segment")
                    if len(x) > frame_count - 4:
                        raise ValueError("too_many_tokens_for_audio_frames")
                    self.examples.append((row, x))
                except ValueError as exc:
                    self.rejected.append({"id": row['id'], "reason": str(exc)})
            self.heldout = heldout

        def __len__(self):
            return len(self.examples)

        def __getitem__(self, index):
            row, x = self.examples[index]
            if index not in self.cache:
                audio, sr = sf.read(row['audio'], dtype="float32")
                if sr != 22050 or audio.ndim != 1:
                    raise ValueError("Unexpected prepared audio format")
                mel = mel_spectrogram(torch.from_numpy(audio)[None], 1024, 80, 22050, 256, 1024, 0, 8000, center=False).squeeze(0)
                self.cache[index] = (mel - model.mel_mean.cpu()) / model.mel_std.cpu()
            # Heldout recording identity is unseen. Use a fixed pretrained voice
            # for validation; loss includes the documented voice/domain mismatch.
            return {"x": x, "y": self.cache[index], "spk": speaker_map.get(row['recording_id'], 423),
                    "filepath": row['audio'], "x_text": row['text'], "durations": None}

    training, validation = Pairs(train), Pairs(val, heldout=True)
    output.mkdir(parents=True, exist_ok=True)
    metadata['filtered_train'] = training.rejected
    metadata['filtered_validation'] = validation.rejected
    metadata['train_count'], metadata['validation_count'] = len(training), len(validation)
    (output / "run.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    if not len(training) or not len(validation):
        raise ValueError("No encodable train/validation data after tokenizer checks")
    if args.dry_run:
        print(json.dumps({"train": len(training), "validation": len(validation), "added_symbols": extra}, ensure_ascii=False))
        return
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    # Preserve normalization statistics of the base model in transfer learning.
    # Recomputing holdout statistics would leak evaluation data.
    optimizer = torch.optim.Adam(model.parameters(), lr=args.learning_rate)
    collate = TextMelBatchCollate(model.n_spks)
    loader = DataLoader(training, batch_size=args.batch_size, shuffle=True, collate_fn=collate, num_workers=0)
    valid_loader = DataLoader(validation, batch_size=args.batch_size, collate_fn=collate, num_workers=0)
    best, history, step = float('inf'), [], 0

    def loss(batch):
        batch = {k: v.to(device) if torch.is_tensor(v) else v for k, v in batch.items()}
        return sum(model.get_losses(batch).values())

    for epoch in range(args.epochs):
        model.train()
        losses = []
        for batch in loader:
            optimizer.zero_grad(set_to_none=True)
            total = loss(batch)
            if not torch.isfinite(total):
                raise RuntimeError("Non-finite training loss")
            total.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 5.0)
            optimizer.step()
            losses.append(total.item())
            step += 1
            if step % 50 == 0:
                print(f"epoch={epoch+1} step={step} loss={np.mean(losses):.4f}", flush=True)
            if args.max_steps > 0 and step >= args.max_steps:
                break
        model.eval()
        with torch.inference_mode():
            # Keep validation randomness (CFM noise/crops) fixed across epochs.
            with torch.random.fork_rng(devices=[0] if device == 'cuda' else []):
                torch.manual_seed(args.seed)
                val_loss = float(np.mean([loss(batch).item() for batch in valid_loader]))
        if not np.isfinite(val_loss):
            raise RuntimeError("Non-finite validation loss")
        history.append({"epoch": epoch + 1, "steps": step, "train_loss": float(np.mean(losses)), "validation_loss": val_loss})
        print(json.dumps(history[-1]), flush=True)
        state = {"state_dict": model.state_dict(), "hyper_parameters": dict(model.hparams),
                 "kashmiri_metadata": metadata, "epoch": epoch, "global_step": step,
                 "optimizer_states": [optimizer.state_dict()], "history": history}
        if val_loss < best:
            best = val_loss
            torch.save(state, output / "best.ckpt")
        torch.save(state, output / "last.ckpt")
        (output / "history.json").write_text(json.dumps(history, indent=2), encoding="utf-8")
        if args.max_steps > 0 and step >= args.max_steps:
            break


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bolbosh-dir", required=True)
    parser.add_argument("--data-dir", default="artifacts/kashmiri-tts")
    parser.add_argument("--base-checkpoint", default="", help="Local checkpoint, otherwise pinned HF model is downloaded")
    parser.add_argument("--checkpoint-cache", default="artifacts/checkpoints")
    parser.add_argument("--output-dir", default="artifacts/kashmiri-finetune")
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--max-steps", type=int, default=-1)
    parser.add_argument("--learning-rate", type=float, default=1e-5)
    parser.add_argument("--seed", type=int, default=20261011)
    parser.add_argument("--dry-run", action="store_true")
    main(parser.parse_args())
