import { useEffect, useRef, useState } from "react";
import { Mic, Send, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

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

// Pick the best available voice for Kashmiri (ur-PK preferred, hi-IN fallback).
function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang === "ur-PK") ||
    voices.find((v) => v.lang.startsWith("ur")) ||
    voices.find((v) => v.lang === "hi-IN") ||
    voices.find((v) => v.lang.startsWith("hi")) ||
    null
  );
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang;
  } else {
    utter.lang = "ur-PK";
  }
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}

function MessageBubble({ msg, onSpeak }: { msg: Message; onSpeak: (text: string) => void }) {
  const dir = msg.isRTL ? "rtl" : "ltr";
  const isUser = msg.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          dir={dir}
          className={[
            "rounded-2xl px-5 py-3 text-[1.15rem] leading-relaxed shadow-sm",
            msg.isRTL ? "font-nastaliq" : "",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-bot-bubble text-bot-bubble-foreground rounded-bl-sm border border-border",
          ].join(" ")}
        >
          {msg.text}
        </div>
        {!isUser && (
          <button
            type="button"
            onClick={() => onSpeak(msg.text)}
            aria-label="Read aloud"
            className="ms-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
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
  const [isListening, setIsListening] = useState(false);
  const [muted, setMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mutedRef = useRef(muted);
  const t = UI_STRINGS[lang];

  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // Prime voices list (Chrome loads asynchronously).
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const cycleLang = () => {
    const idx = LANG_ORDER.indexOf(lang);
    setLang(LANG_ORDER[(idx + 1) % LANG_ORDER.length]);
  };

  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("آپ کا براؤزر آواز کی سہولت نہیں دیتا");
      return;
    }
    speak(text);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (next && typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  const handleMicClick = () => {
    const SR: any =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      toast.error("آپ کا براؤزر آواز کی سہولت نہیں دیتا");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SR();
    recognition.lang = "ur-PK";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (e: any) => {
      setIsListening(false);
      recognitionRef.current = null;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast.error("مائیکروفون کی اجازت درکار ہے", {
          description: "Please allow microphone access in your browser settings.",
        });
      } else if (e.error === "no-speech") {
        toast("کوئی آواز نہیں سنی گئی");
      } else if (e.error !== "aborted") {
        toast.error("آواز کی شناخت میں مسئلہ");
      }
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
    }
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
      if (!mutedRef.current) speak(reply);
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
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={toggleMute}
              aria-label={muted ? "Unmute auto-read" : "Mute auto-read"}
              aria-pressed={muted}
              title={muted ? "Auto-read off" : "Auto-read on"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button
              onClick={cycleLang}
              aria-label="Switch language"
              className="rounded-full border border-border bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:px-4 sm:text-base"
            >
              <span className={lang === "ks" ? "font-nastaliq text-lg" : ""}>{t.langLabel}</span>
            </button>
          </div>
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
                <MessageBubble key={m.id} msg={m} onSpeak={handleSpeak} />
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
            <div className="relative shrink-0">
              {isListening && <span className="mic-listening-ring" aria-hidden="true" />}
              <button
                type="button"
                onClick={handleMicClick}
                aria-label={t.mic}
                aria-pressed={isListening}
                className={[
                  "flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  isListening ? "mic-listening" : "",
                ].join(" ")}
              >
                <Mic className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
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
