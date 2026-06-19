import { useEffect, useRef, useState } from "react";
import { Mic, Send } from "lucide-react";

type Role = "user" | "assistant";
type Lang = "ks" | "ur" | "en";

interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isRTL: boolean;
}

// Detect RTL by looking for Arabic/Urdu/Kashmiri/Hebrew script in the text.
const RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const isRTL = (text: string) => RTL_REGEX.test(text);

const MOCK_REPLIES = [
  "ہا، بہ چھُس تہند مدد کرنہٕ خٲطرٕ تیار۔ توہیہ کیا پوچھنہٕ چھِو؟",
  "شکریہ توہند سوال خٲطرٕ۔ بہ کوشِش کرہ توہیہ بہترین جواب دِنہٕ۔",
  "یہٕ اکھ دلچسپ سوال چھُ۔ ژِھ سیکنڈ، بہ سوچان چھُس...",
];

const UI_STRINGS: Record<Lang, {
  title: string;
  subtitle: string;
  empty: string;
  placeholder: string;
  send: string;
  mic: string;
  langLabel: string;
  emptyDir: "rtl" | "ltr";
  emptyClass: string;
}> = {
  ks: {
    title: "کٲشُر مددگار",
    subtitle: "Your Kashmiri Assistant",
    empty: "سلام! میٚ کیا مدد کٔری آپ کٕس?",
    placeholder: "اَتہِ لیٚکھِو۔۔۔",
    send: "بھیجِو",
    mic: "آواز",
    langLabel: "کٲشُر",
    emptyDir: "rtl",
    emptyClass: "font-nastaliq",
  },
  ur: {
    title: "کٲشُر مددگار",
    subtitle: "آپ کا کشمیری معاون",
    empty: "سلام! میں آپ کی کیا مدد کر سکتا ہوں؟",
    placeholder: "یہاں لکھیں...",
    send: "بھیجیں",
    mic: "آواز",
    langLabel: "Urdu",
    emptyDir: "rtl",
    emptyClass: "font-nastaliq",
  },
  en: {
    title: "کٲشُر مددگار",
    subtitle: "Your Kashmiri Assistant",
    empty: "Hello! How can I help you today?",
    placeholder: "Type a message...",
    send: "Send",
    mic: "Voice",
    langLabel: "English",
    emptyDir: "ltr",
    emptyClass: "",
  },
};

const LANG_ORDER: Lang[] = ["ks", "ur", "en"];

function MessageBubble({ msg }: { msg: Message }) {
  const dir = msg.isRTL ? "rtl" : "ltr";
  const isUser = msg.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        dir={dir}
        className={[
          "max-w-[85%] rounded-2xl px-5 py-3 text-[1.15rem] leading-relaxed shadow-sm",
          msg.isRTL ? "font-nastaliq" : "",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-bot-bubble text-bot-bubble-foreground rounded-bl-sm border border-border",
        ].join(" ")}
      >
        {msg.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-bot-bubble px-5 py-4 shadow-sm">
        <span className="typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="typing-dot" style={{ animationDelay: "150ms" }} />
        <span className="typing-dot" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export default function KashmirBot() {
  const [lang, setLang] = useState<Lang>("ks");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = UI_STRINGS[lang];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const cycleLang = () => {
    const idx = LANG_ORDER.indexOf(lang);
    setLang(LANG_ORDER[(idx + 1) % LANG_ORDER.length]);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isThinking) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      timestamp: Date.now(),
      isRTL: isRTL(text),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsThinking(true);

    // Mock reply
    setTimeout(() => {
      const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: reply,
        timestamp: Date.now(),
        isRTL: isRTL(reply),
      };
      setMessages((m) => [...m, botMsg]);
      setIsThinking(false);
    }, 1500);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const inputIsRTL = isRTL(input) || lang !== "en";

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <span className="font-nastaliq text-2xl leading-none">ک</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-nastaliq truncate text-2xl sm:text-3xl text-foreground" dir="rtl">
                کٲشُر مددگار
              </h1>
              <p className="truncate text-sm sm:text-base text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={cycleLang}
            aria-label="Switch language"
            className="shrink-0 rounded-full border border-border bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:px-4 sm:text-base"
          >
            <span className={lang === "ks" ? "font-nastaliq text-lg" : ""}>{t.langLabel}</span>
            <span className="mx-2 text-muted-foreground">|</span>
            <span className="text-muted-foreground text-xs sm:text-sm">
              {LANG_ORDER.filter((l) => l !== lang).map((l) => UI_STRINGS[l].langLabel).join(" · ")}
            </span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
          {messages.length === 0 && !isThinking ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                <span className="font-nastaliq text-4xl leading-none">سلام</span>
              </div>
              <p
                dir={t.emptyDir}
                className={`max-w-md text-2xl sm:text-3xl text-foreground ${t.emptyClass}`}
              >
                {t.empty}
              </p>
              <p className="mt-4 text-base text-muted-foreground">
                {lang === "en" ? "Tap the microphone or start typing below." : null}
              </p>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <MessageBubble key={m.id} msg={m} />
              ))}
              {isThinking && <TypingIndicator />}
            </>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:py-4">
          <div className="flex items-end gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={t.mic}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Mic className="h-6 w-6" aria-hidden="true" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t.placeholder}
              dir={inputIsRTL ? "rtl" : "ltr"}
              rows={1}
              className={[
                "min-h-14 max-h-40 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-lg text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                inputIsRTL ? "font-nastaliq" : "",
              ].join(" ")}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              aria-label={t.send}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
