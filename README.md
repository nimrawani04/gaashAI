GaashAI-گاش اے آئی

> **Your Kashmiri AI Assistant & Learning Platform** — A comprehensive multilingual assistant, translation tool, dictionary, and adaptive learning engine designed for Kashmiri (کٲشُر), Urdu, and English, featuring native speech synthesis, vision OCR, and offline-first mobile capabilities.

GaashAI serves as a powerful bridge for the Kashmiri language, empowering native speakers, students, teachers, and language enthusiasts. It combines conversational AI in authentic Nastaliq script with a dedicated bidirectional translation interface, an interactive adaptive learning engine, a searchable Kashmiri dictionary, a structured language pack, and advanced multimodal image recognition.

---

## ✨ Features

| Feature | Description |
| --- | --- |
| **Trilingual Chat** | Conversational AI in Kashmiri (Nastaliq), Urdu, and English |
| **Adaptive Learning (`/learn`)** | Converts textbook pages into grade-level Kashmiri lessons with quizzes |
| **Kashmiri Dictionary (`/dictionary`)** | 70+ word searchable lexicon with Roman spelling, examples, and audio |
| **Language Pack (`/kashmiri`)** | Everyday phrases, essential grammar rules, and pronunciation guides |
| **Translation Tool (`/translate`)** | Bidirectional English ⇄ Kashmiri translation with Roman transliteration |
| **Image & PDF OCR** | AI vision text extraction from textbook photos and documents |
| **Voice TTS & STT** | Native Kashmiri voice synthesis (Matcha-TTS/KTTS) and microphone input |
| **Offline-First Mobile** | Native Capacitor storage keeps lesson progress available offline with cloud sync |
| **Kashmiri Design** | Authentic Chinar-themed UI, Nastaliq typography, and dark/light modes |

---

## 🛠️ Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev)
- **Bundler:** [Vite](https://vite.dev)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com) + Kashmiri Nastaliq typography
- **Mobile Runtime:** [Capacitor](https://capacitorjs.com) (Preferences, Haptics, App, Status Bar)
- **Backend:** [Supabase](https://supabase.com) (Auth, Database, Edge Functions, Storage)
- **Speech Synthesis (TTS):** [Bolbosh](https://github.com/gaash-lab/Bolbosh) + [Matcha-TTS](https://huggingface.co/GAASH-Lab/Matcha-TTS-Kashmiri)
- **Language:** TypeScript
- **UI Components:** [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com)

---

## 📁 Project Structure

```
kashmiriBot/
├── scripts/
│   ├── prepare_kashmiri_tts.py       # Audio corpus validation, resampling, and manifests
│   ├── evaluate_kashmiri_tts.py      # Checkpoint evaluation (MCD, ASR proxy, listener ratings)
│   └── fine_tune_kashmiri.py         # Bolbosh fine-tuning launcher
├── tts_server/
│   ├── app.py                         # HTTP synthesis API for local PyTorch/HiFi-GAN checkpoint
│   └── README.md                      # GPU deployment guide
├── src/
│   ├── components/
│   │   ├── chat/                      # KashmirBot, SessionsPanel, FeedbackButtons
│   │   ├── learn/                     # ConceptDiagram, LessonChat, LessonHistoryView, QuizReviewDialog, SyllabusDialog
│   │   ├── auth/                      # Authentication & Guest login screens
│   │   ├── admin/                     # Community submissions & admin dashboard
│   │   ├── ListenButton.tsx           # Multi-tier Kashmiri audio player component
│   │   └── ui/                        # Reusable shadcn/ui components
│   ├── lib/
│   │   ├── learn.functions.ts         # Adaptive lesson & quiz generation functions
│   │   ├── lesson-progress.ts         # Offline-first Capacitor Preferences & cloud sync
│   │   ├── lexicon.ts                 # Searchable Kashmiri dictionary dataset & normalizer
│   │   ├── kashmiri-pack.ts           # Curated phrases, grammar rules, and phonetic data
│   │   ├── kashmiri-voice-player.ts   # Audio playback & fallback cascade
│   │   ├── translate.functions.ts     # Translation API handler
│   │   └── vision.functions.ts        # OCR and textbook document extraction
│   ├── routes/
│   │   ├── index.tsx                  # Trilingual chat assistant
│   │   ├── learn.tsx                  # Adaptive Learning Engine (textbook → lesson)
│   │   ├── dictionary.tsx             # Searchable Kashmiri lexicon with audio
│   │   ├── kashmiri.tsx               # Kashmiri Language Pack (phrases, grammar, sounds)
│   │   ├── translate.tsx              # English ⇄ Kashmiri translation tool & phrasebook
│   │   ├── contribute.tsx             # Community phrase contribution ("دیو مدد")
│   │   ├── auth.tsx                   # User authentication & OAuth callback
│   │   └── admin.tsx                  # Admin dashboard for reviewed submissions
│   └── styles.css                     # Global styles, Chinar theme tokens, Nastaliq fonts
├── supabase/
│   ├── functions/                     # Supabase Edge Functions (chat, embed, vision)
│   └── migrations/                    # Database migrations & schemas
├── .env.example                       # Environment variable template
└── package.json
```

---

## 📖 Feature Overview

### 🎓 Adaptive Learning Engine (`/learn`)
Converts textbook photos, PDFs, or syllabus topics into grade-level Kashmiri lessons. Automatically generates simplified explanations in Nastaliq script, local Kashmiri analogies (e.g. Kangri, Dal Lake), voice narration, visual concept diagrams, interactive in-lesson tutor chat, and diagnostic quizzes that spot weak concepts.

### 📚 Kashmiri Dictionary (`/dictionary`)
Searchable Kashmiri lexicon (70+ entries) with instant lookup across Nastaliq, Roman transliteration, or English definitions. Each card displays grammatical tags, variant spellings, contextual example sentences, and one-tap voice pronunciation.

### 🗣️ Kashmiri Language Pack (`/kashmiri`)
A structured Kashmiri learning resource divided into three areas:
- **Everyday Phrases:** Common greetings, courtesies, and conversational essentials.
- **Grammar Guide:** Core rules on verb-second (V2) word order, noun cases, postpositions, and gender agreement.
- **Pronunciation:** Native audio guides for distinct Kashmiri vowels and aspirated consonants.

### 🌐 Trilingual Translation (`/translate`)
Dedicated bidirectional English ⇄ Kashmiri translator with Roman pronunciation guides, persistent translation history, and quick-tap everyday phrase cards.

### 👁️ Image & Document OCR
Multimodal AI vision that extracts text directly from textbook snapshots, PDFs, and uploaded documents for immediate translation, lookup, or lesson creation.

### 🔊 Kashmiri Voice Synthesis (TTS & STT)
High-fidelity speech synthesis powered by Bolbosh & Matcha-TTS trained on the KTTS Kashmiri male corpus, featuring automatic audio caching and fallback support. Includes speech-to-text voice input for hands-free messaging.

### 📱 Offline-First Mobile Experience
Built with Capacitor for Android, iOS, and Web. Quiz results and lesson progress are stored directly in device storage (`@capacitor/preferences`) for full offline access, and automatically synchronized to Supabase when an internet connection is available.

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
 
### 4. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---
