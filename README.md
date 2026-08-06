# Kashur Connect

Build a React PWA called "KashmirBot" using Vite + TypeScript + Tailwind CSS.

Create a full-screen chat interface with these requirements:

- RTL support for Kashmiri/Urdu text (Noto Nastaliq Urdu font from Google Fonts)

- A message bubble component that auto-detects if text is RTL or LTR and applies direction accordingly

- A text input at the bottom with a send button and a microphone button (mic button is UI only for now, we'll wire it later)

- A language toggle in the header: "کٲشُر | Urdu | English" — clicking switches the UI language label

- Large accessible font sizes (minimum 18px for chat bubbles) and high-contrast colors — this app is for elderly users

- A top header with the app name in Kashmiri script: "کٲشُر مددگار" and a subtitle "Your Kashmiri Assistant"

- Empty state with the message: "سلام! میٚ کیا مدد کٔری آپ کٕس?" displayed in the center when no messages exist

- Mobile-first responsive layout

- A typing indicator (three animated dots) that shows when bot is "thinking"

- Store chat messages in React state: { id, role: 'user'|'assistant', text, timestamp, isRTL }

Do not connect any API yet. Use a mock function that returns a hardcoded Kashmiri reply after 1.5 seconds to simulate the bot responding.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f10d8ce1-204b-4d41-9dbb-3725d39495e3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
