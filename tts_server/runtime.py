"""Shared inference/training loader; saved tokenizer travels with the checkpoint."""
from __future__ import annotations

import io
import sys
import types
from pathlib import Path

import numpy as np
import soundfile as sf
import torch


def enable_portable_alignment():
    """Use a NumPy MAS implementation when the optional C extension is absent.

    Same monotonic constraints as Matcha: each token occupies >=1 frame,
    and each next frame stays on its token or advances by exactly one token.
    The compiled upstream implementation remains preferred on training hosts.
    """
    name = "matcha.utils.monotonic_align.core"
    import matcha.utils
    core_dir = Path(matcha.utils.__file__).parent / "monotonic_align"
    if any(core_dir.glob("core*.pyd")) or any(core_dir.glob("core*.so")):
        return

    def maximum_path_c(paths, values, t_xs, t_ys, max_neg_val=-1e9):
        for batch, (tokens, frames) in enumerate(zip(t_xs, t_ys)):
            tokens, frames = int(tokens), int(frames)
            if frames < tokens:
                raise ValueError("Audio has fewer mel frames than text tokens")
            scores = np.full(tokens, max_neg_val, dtype=np.float32)
            scores[0] = 0
            advance = np.zeros((tokens, frames), dtype=bool)
            for frame in range(frames):
                previous = np.concatenate(([max_neg_val], scores[:-1]))
                take = previous > scores
                scores = np.maximum(scores, previous) + values[batch, :tokens, frame]
                invalid = (np.arange(tokens) > frame) | (np.arange(tokens) < tokens + frame - frames)
                scores[invalid] = max_neg_val
                advance[:, frame] = take
            token = tokens - 1
            for frame in range(frames - 1, -1, -1):
                paths[batch, token, frame] = 1
                if token and advance[token, frame]:
                    token -= 1

    module = types.ModuleType(name)
    module.maximum_path_c = maximum_path_c
    sys.modules[name] = module


def load_model(path, device="cpu"):
    enable_portable_alignment()
    from matcha.models.matcha_tts import MatchaTTS
    checkpoint = torch.load(path, map_location="cpu", weights_only=False)
    model = MatchaTTS(**checkpoint["hyper_parameters"])
    model.load_state_dict(checkpoint["state_dict"], strict=True)
    return model.to(device), checkpoint.get("kashmiri_metadata")


def encode_text(text, metadata=None):
    if metadata:
        from scripts.prepare_kashmiri_tts import clean_transcript
        text = clean_transcript(text)
        mapping = {symbol: i for i, symbol in enumerate(metadata["symbols"])}
        unknown = sorted(set(text) - mapping.keys())
        if unknown:
            raise ValueError(f"Unsupported characters: {unknown!r}; text was not silently stripped")
        ids = [mapping[char] for char in text]
    else:
        from matcha.text import text_to_sequence
        ids, text = text_to_sequence(text, ["basic_cleaners"])
    if not ids:
        raise ValueError("Text contains no supported speech tokens")
    result = [0] * (2 * len(ids) + 1)
    result[1::2] = ids
    return torch.tensor(result, dtype=torch.long)


class Voice:
    def __init__(self, checkpoint, vocoder, device="cpu", speaker=423):
        self.device = device
        self.model, self.metadata = load_model(checkpoint, device)
        from matcha.cli import load_vocoder
        self.model.eval()
        self.vocoder, self.denoiser = load_vocoder("hifigan_univ_v1", vocoder, device)
        self.speaker = self.metadata.get("default_speaker", speaker) if self.metadata and speaker == 423 else speaker

    @torch.inference_mode()
    def wav(self, text, steps=10, speaker=None):
        from matcha.cli import to_waveform
        x = encode_text(text, self.metadata).unsqueeze(0).to(self.device)
        spk = self.speaker if speaker is None else speaker
        if not 0 <= spk < self.model.n_spks:
            raise ValueError("Speaker outside checkpoint range")
        output = self.model.synthesise(
            x, torch.tensor([x.shape[1]], device=self.device),
            n_timesteps=steps, temperature=0.667,
            spks=torch.tensor([spk], device=self.device), length_scale=1.0,
        )
        audio = to_waveform(output["mel"], self.vocoder, self.denoiser).cpu().numpy()
        if not np.isfinite(audio).all() or not len(audio):
            raise ValueError("Invalid generated waveform")
        buffer = io.BytesIO()
        sf.write(buffer, audio, 22050, format="WAV", subtype="PCM_16")
        return buffer.getvalue()
