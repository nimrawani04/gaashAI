GaashAI-گاش اے آئی

> **Your Kashmiri AI Assistant** — A powerful multilingual translation bot and chatbot that helps users communicate in Kashmiri (کٲشُر), Urdu, and English, featuring advanced image recognition capabilities.

GaashAI serves as a comprehensive tool for bridging language gaps, acting primarily as a sophisticated **translation bot** and conversational agent. It empowers users to converse naturally across Kashmiri, Urdu, and English while offering a dedicated translation interface. The integrated **image recognition** feature takes this a step further, allowing users to upload images, extract text automatically, and receive instant translations—making it easier than ever to digitize and understand physical documents.

---

## ✨ Features

| Feature                     | Details                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| **Trilingual Chat**         | Kashmiri (Nastaliq script), Urdu, and English — switch with one tap     |
| **Translation Tool**        | Dedicated page to translate Kashmiri, Urdu, and English text             |
| **Image Recognition**       | Analyze images and extract text with AI vision capabilities             |
| **AI-Powered Responses**    | Powered by Lovable AI via Supabase Edge Functions                       |
| **Kashmiri TTS**            | GAASH-Lab Matcha-TTS-Kashmiri with a Listen button in chat, translation, and lessons |
| **Voice Input**             | Speak your message using the built-in microphone button                 |
| **RTL Support**             | Automatic right-to-left layout for Kashmiri and Urdu text               |
| **Chat Sessions**           | Persistent conversation history stored in Supabase                      |
| **File Attachments**        | Drag & drop or click to attach images, PDFs, and documents              |
| **Community Contributions** | Users can submit Kashmiri phrases to grow the knowledge base            |
| **Feedback System**         | Thumbs up/down on bot responses to improve quality                      |
| **Accessibility**           | Large fonts, high contrast, and elder-friendly design                   |

---

## 🛠️ Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev)
- **Bundler:** [Vite 8](https://vite.dev)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com)
- **Backend:** [Supabase](https://supabase.com) (Auth, Database, Edge Functions, Storage)
- **Language:** TypeScript
- **UI Components:** [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com)
- **Deployment:** Cloudflare (via Nitro)

---

## 📁 Project Structure

```
kashmiriBot/
├── scripts/
│   ├── prepare_kashmiri_tts.py       # HF download, validation, cleaning, splits
│   ├── evaluate_kashmiri_tts.py      # checkpoint/audio/MCD/ASR/MOS evaluation
│   └── fine_tune_kashmiri.py         # Bolbosh fine-tuning launcher
├── tts_server/
│   ├── app.py                         # HTTP adapter for a local fine-tuned model
│   └── README.md                      # GPU deployment instructions
├── src/
│   ├── data/               # BPCC corpus & dataset files (bpcc_kashmiri_training_data.csv)
│   ├── components/
│   │   ├── chat/           # KashmirBot, SessionsPanel, FeedbackButtons
│   │   ├── auth/           # Authentication components
│   │   ├── admin/          # Admin dashboard
│   │   └── ui/             # Reusable shadcn/ui components
│   ├── lib/
│   │   ├── kashmiri-voice.functions.ts # Matcha-TTS server function
│   │   ├── kashmiri-voice-player.ts    # Cached model audio playback
│   │   └── tts.ts          # Browser fallback for English/Urdu and chunking
│   │   └── supabase.ts     # Supabase client
│   ├── routes/
│   │   ├── index.tsx        # Main chat page
│   │   ├── auth.tsx         # Login / signup
│   │   ├── contribute.tsx   # Community contribution form
│   │   ├── translate.tsx    # Translation tool and phrasebook
│   │   └── admin.tsx        # Admin dashboard
│   └── styles.css           # Global styles & design tokens
├── supabase/
│   ├── functions/           # Edge Functions (chat, embed)
│   └── migrations/          # Database migrations
├── .env.example             # Environment variable template
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+ (or [Bun](https://bun.sh))
- A [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/nimrawani04/kashmiriBot.git
cd kashmiriBot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-public-key

# Optional server aliases for deployed functions
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-public-key
```

> ⚠️ **Never commit your `.env` file.** It is excluded via `.gitignore`.

### 4. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔊 Kashmiri audio model

The target production voice is the male **[KTTS Single Speaker Dataset](https://data.mendeley.com/datasets/5c4dcvxdmb/2)** corpus: 2,984 Kashmiri WAV recordings with `textcorpus.csv`, published as Mendeley Data version 2 under CC BY NC 3.0. The app requests `voice: "Male"` by default and sends the selected dialect to the configured service. For new text, set `KASHMIRI_TTS_URL` to the service built from the fine-tuned checkpoint; the app calls its `POST /api/synthesize` endpoint and receives a WAV URL. The server validates the dialect (`kupwara`, `bandipora`, `shopian`, or `islamabad`) and rejects non-male requests for this checkpoint so the app cannot silently fall back to the wrong voice. The public Kashmiri-specific **[GAASH-Lab/Matcha-TTS-Kashmiri](https://huggingface.co/GAASH-Lab/Matcha-TTS-Kashmiri)** demo is retained as a last-resort fallback. Listen buttons identify whether they played corpus audio, the fine-tuned corpus model, or the existing checkpoint. See [`tts_server/README.md`](tts_server/README.md) for the PyTorch/HiFi-GAN service.

Source roles:

- **[Mendeley KTTS Single Speaker Dataset](https://data.mendeley.com/datasets/5c4dcvxdmb/2)**: primary male TTS fine-tuning source.
- **[gaash-lab/Bolbosh](https://github.com/gaash-lab/Bolbosh)**: Matcha-TTS/HiFi-GAN Kashmiri framework used for training and serving.
- **[programindz/kashmiri-audio-corpus](https://huggingface.co/datasets/programindz/kashmiri-audio-corpus)**: playable audio/text reference corpus and optional supplemental training data.
- **[Omarrran/kashmiri_words_dataset_restructured](https://huggingface.co/datasets/Omarrran/kashmiri_words_dataset_restructured)**: spoken-word recognition/pronunciation coverage data; not a full-sentence TTS source.
- **[Kaggle converteddatanew](https://www.kaggle.com/datasets/umar1103/converteddatanew)**: optional local audio+CSV import when downloaded with Kaggle credentials.

### Reproduce the data preparation

Download and extract the Mendeley KTTS archive, then point the preparation script at the extracted folder containing `Recordings/` and `Text Files/textcorpus.csv`:

```bash
python -m pip install datasets soundfile scipy huggingface_hub
python scripts/prepare_kashmiri_tts.py --mendeley-dir path/to/KTTS --output-dir artifacts/kashmiri-tts
```

For the Kaggle download or another local WAV+CSV corpus, point the generic local importer at the extracted folder:

```bash
python scripts/prepare_kashmiri_tts.py \
  --local-csv-dir path/to/converteddatanew \
  --local-source-name kaggle-converteddatanew \
  --local-source-url https://www.kaggle.com/datasets/umar1103/converteddatanew \
  --output-dir artifacts/kashmiri-tts-kaggle
```

The script still supports the previous pinned Hugging Face corpus when `--mendeley-dir` is omitted. The command:

- validates encoded WAVs, finite samples, loudness/silence, clipping, and the presence of Perso-Arabic script;
- resamples valid audio to mono 22.05 kHz for Matcha-TTS;
- applies NFC and safe orthographic cleanup while retaining Arabic combining marks, joining characters, punctuation, letters, names, and digits; and
- writes `train`, `validation`, and `test` file lists plus `metadata.json`, `rejected.json`, `rows.jsonl`, and a vocabulary audit.

The Mendeley KTTS source is a single male speaker, so all prepared rows use speaker slot `0`. For older sources without speaker labels, the script keeps deterministic recording proxy speaker slots and records that limitation in metadata.

The validation run performed during implementation found **1,955 source rows**, **1,871 valid pairs**, **84 rejected rows**, and **2.172 hours** after filtering. It produced **1,566 train / 162 validation / 143 test** examples. The corpus contained 209 44.1 kHz and 23 32 kHz source files despite the dataset card's 16 kHz description; all valid files are normalized to 22.05 kHz.

### Evaluate the existing Kashmiri checkpoint first

The evaluator uses the public GAASH-Lab Gradio Space and keeps generated audio out of git:

```bash
python scripts/evaluate_kashmiri_tts.py \
  --manifest artifacts/kashmiri-tts/manifests/test.txt \
  --limit 8 \
  --label GAASH-Lab/Matcha-TTS-Kashmiri
```

It checks generated WAVs, computes a DTW-aligned MFCC distance proxy when `librosa` is available, and writes a native-speaker rating sheet with 1–5 columns for intelligibility, pronunciation, and naturalness. Use `--ratings path/to/completed-ratings.csv` to add human means to the report. An optional ASR proxy can be supplied with `--asr-model`; gated models such as AI4Bharat's Kashmiri Conformer require an authenticated Hugging Face account.

The existing checkpoint was smoke-evaluated against three held-out examples during implementation: all three generated valid 22.05 kHz, unclipped WAVs. Human pronunciation and naturalness scores are intentionally not invented; complete the generated `ratings.csv` with native Kashmiri listeners.

### Fine-tune Bolbosh/Matcha-TTS

Use the existing Kashmiri checkpoint as the initialization after the baseline evaluation. The launcher uses PyTorch directly, so it can run on a GPU host without Hydra's external trainer wrapper:

```bash
git clone https://github.com/gaash-lab/Bolbosh.git ../Bolbosh
# Use Python 3.10 or 3.11 for the upstream Bolbosh/NumPy dependency set.
python -m pip install -r ../Bolbosh/requirements.txt
python -m pip install soundfile scipy huggingface_hub

python scripts/fine_tune_kashmiri.py \
  --data-dir artifacts/kashmiri-tts \
  --bolbosh-dir ../Bolbosh \
  --base-checkpoint GAASH-Lab/Matcha-TTS-Kashmiri \
  --output-dir artifacts/kashmiri-finetune \
  --batch-size 2 --epochs 20
```

The launcher uses the official script-aware 272-grapheme Bolbosh architecture/checkpoint, KashmiriNormalizer-compatible character conditioning, 80-bin mel features, 22.05 kHz statistics, recording-disjoint validation, and a low learning rate (`1e-5`) for transfer learning. It downloads the pinned `model.ckpt` from Hugging Face when a local checkpoint is not supplied. New graphemes are initialized from the base embedding mean and recorded in `run.json`; pretrained rows are never reindexed. A GPU is strongly recommended. Use `--dry-run` to validate the manifest, OOV policy, and split isolation without updating weights. The server runtime can use the same portable NumPy alignment fallback on machines without a C compiler.

After exporting a best checkpoint behind `tts_server/app.py`, run the same evaluator with its Gradio-compatible endpoint or local generated WAVs, complete the listener sheet, and compare the fine-tuned report with the existing-checkpoint report before switching production traffic.

## 📦 Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the development server |
| `npm run build`   | Build for production         |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |
| `npm run format`  | Format code with Prettier    |

---

## 🤝 Contributing

Contributions are welcome! You can help by:

1. **Adding Kashmiri phrases** — Use the in-app "دیو مدد" (Contribute) page
2. **Reporting bugs** — Open a GitHub issue
3. **Submitting PRs** — Fork, branch, and submit a pull request

---
