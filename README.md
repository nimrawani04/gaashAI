GaashAI-گاش اے آئی

> **Your Kashmiri AI Assistant** — a multilingual chatbot that helps users communicate in Kashmiri (کٲشُر), Urdu, and English.

---

## ✨ Features

| Feature                     | Details                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| **Trilingual Chat**         | Kashmiri (Nastaliq script), Urdu, and English — switch with one tap     |
| **AI-Powered Responses**    | Powered by Lovable AI via Supabase Edge Functions                       |
| **Read Aloud (TTS)**        | Browser text-to-speech with automatic voice selection for Urdu/Kashmiri |
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
├── src/
│   ├── components/
│   │   ├── chat/           # KashmirBot, SessionsPanel, FeedbackButtons
│   │   ├── auth/           # Authentication components
│   │   ├── admin/          # Admin dashboard
│   │   └── ui/             # Reusable shadcn/ui components
│   ├── lib/
│   │   ├── tts.ts          # Text-to-speech engine (voice selection, chunking)
│   │   └── supabase.ts     # Supabase client
│   ├── routes/
│   │   ├── index.tsx        # Main chat page
│   │   ├── auth.tsx         # Login / signup
│   │   ├── contribute.tsx   # Community contribution form
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

## 🔗 Lovable Integration

This project is connected to [Lovable](https://lovable.dev). Changes pushed to `main` sync back into the Lovable editor.

- **Lovable Editor:** [Open in Lovable](https://lovable.dev/projects/f10d8ce1-204b-4d41-9dbb-3725d39495e3)
- Every change made in Lovable is committed to this repository
- Avoid force-pushing or rewriting published git history

---

## 📄 License

This project is private. All rights reserved.
