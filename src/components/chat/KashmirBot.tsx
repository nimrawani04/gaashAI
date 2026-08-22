import { useEffect, useRef, useState, useCallback, memo, lazy, Suspense } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { readImage } from "@/lib/vision.functions";
import { Mic, Send, Volume2, VolumeX, LogOut, Menu, HeartHandshake, Paperclip, X, FileText, Loader2, Languages, Copy, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase, type ChatSession, type ChatMessageRow } from "@/lib/supabase";
const SessionsPanel = lazy(() => import("@/components/chat/SessionsPanel"));
import FeedbackButtons from "@/components/chat/FeedbackButtons";
import { speak, stopSpeaking, ttsSupported, getVoices, unlockTts, installTtsUnlock, cleanForSpeech } from "@/lib/tts";
import { startRecording, blobToBase64, type Recorder } from "@/lib/recorder";
import { transcribeSpeech } from "@/lib/stt.functions";
import { getSpeech, prefetchSpeech } from "@/lib/ttsCache";
import ChinarLoader from "@/components/ChinarLoader";
import GuestPrompt from "@/components/GuestPrompt";
import { bumpGuestUses, guestLimitReached, type GuestFeature } from "@/lib/guest";
import { localChatReply } from "@/lib/lexicon";

// Lovable AI is the only backend — no local fallback Q&A.

type Role = "user" | "assistant";
type Lang = "ks" | "ur" | "en";

interface Message {
  id: string;
  dbId?: string;
  role: Role;
  text: string;
  timestamp: number;
  isRTL: boolean;
}

const RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const isRTL = (text: string) => RTL_REGEX.test(text);


const UI_STRINGS: Record<Lang, {
  subtitle: string;
  empty: string;
  placeholder: string;
  send: string;
  mic: string;
  langLabel: string;
  emptyDir: "rtl" | "ltr";
  emptyClass: string;
}> = {
  ks: { subtitle: "Your Kashmiri Assistant", empty: "سلام! میٚ کیا مدد کٔری آپ کٕس?", placeholder: "اَتہِ لیٚکھِو۔۔۔", send: "بھیجِو", mic: "آواز", langLabel: "کٲشُر", emptyDir: "rtl", emptyClass: "font-nastaliq" },
  ur: { subtitle: "آپ کا کشمیری معاون", empty: "سلام! میں آپ کی کیا مدد کر سکتا ہوں؟", placeholder: "یہاں لکھیں...", send: "بھیجیں", mic: "آواز", langLabel: "Urdu", emptyDir: "rtl", emptyClass: "font-nastaliq" },
  en: { subtitle: "Your Kashmiri Assistant", empty: "Hello! How can I help you today?", placeholder: "Type a message...", send: "Send", mic: "Voice", langLabel: "English", emptyDir: "ltr", emptyClass: "" },
};

const LANG_ORDER: Lang[] = ["ks", "ur", "en"];

// TTS helpers live in @/lib/tts (voice loading, chunking, Chrome quirks).


const ATTACH_RE = /^📎 \[(.+?)\]\((.+?)\)$/;
const IMG_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i;

function renderMessageContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const m = line.match(ATTACH_RE);
    if (m) {
      const [, name, url] = m;
      const isImage = IMG_EXT_RE.test(url) || IMG_EXT_RE.test(name);
      if (isImage) {
        return (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
            <img src={url} alt={name} className="max-h-64 max-w-full rounded-lg border border-border/50" />
          </a>
        );
      }
      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 px-3 py-2 text-sm underline-offset-2 hover:underline"
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span className="truncate max-w-[200px]">{name}</span>
        </a>
      );
    }
    return (
      <span key={i}>
        {line}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

const SPEEDS = [0.9, 1, 1.1] as const;

const MessageBubble = memo(function MessageBubble({
  msg,
  onSpeak,
  userId,
  speaking,
  lang,
  rate,
  onRate,
}: {
  msg: Message;
  onSpeak: (text: string, id: string) => void;
  userId: string;
  speaking: boolean;
  lang: Lang;
  rate: number;
  onRate: (r: number) => void;
}) {
  const dir = msg.isRTL ? "rtl" : "ltr";
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} my-1`}
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 72px" } as React.CSSProperties}
    >
      <div className={`flex max-w-[92%] xs:max-w-[85%] sm:max-w-[80%] md:max-w-[75%] flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        {/* Role & Script Indicator */}
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted-foreground">
          {isUser ? (
            <span>You</span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {msg.isRTL ? "کٲشُر — Kashmiri" : "Assistant"}
            </span>
          )}
        </div>

        {/* Message Bubble Container */}
        <div
          dir={dir}
          className={[
            "rounded-[16px] px-4 py-3 text-base sm:text-lg leading-relaxed shadow-sm transition-colors",
            msg.isRTL ? "font-nastaliq" : "",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-[4px]"
              : "bg-bot-bubble text-bot-bubble-foreground border border-border rounded-bl-[4px]",
          ].join(" ")}
        >
          {renderMessageContent(msg.text)}
        </div>

        {/* Action Bar: Copy (all messages), Audio & Feedback (assistant) */}
        <div className={`flex items-center gap-2 pt-0.5 px-1 ${isUser ? "justify-end" : ""}`}>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy message"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-[8px] px-3 text-xs font-medium transition border border-border bg-secondary text-secondary-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {copied ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          {!isUser && (
            <button
              type="button"
              onClick={() => onSpeak(msg.text, msg.id)}
              aria-label={speaking ? "Stop reading aloud" : "Listen to response"}
              aria-pressed={speaking}
              className={[
                "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-[8px] px-3 text-xs font-medium transition border border-border bg-secondary text-secondary-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                speaking ? "text-primary border-primary animate-pulse" : "",
              ].join(" ")}
            >
              <Volume2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{speaking ? "Stop" : "Listen"}</span>
            </button>
          )}
          {!isUser && speaking && (
            <div
              className="inline-flex items-center gap-1 rounded-[8px] border border-border bg-secondary px-1.5 py-1"
              role="group"
              aria-label="Playback speed"
            >
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onRate(s)}
                  aria-pressed={rate === s}
                  className={[
                    "min-h-[36px] rounded-[6px] px-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-ring",
                    rate === s
                      ? "bg-primary text-primary-foreground"
                      : "text-secondary-foreground hover:bg-accent",
                  ].join(" ")}
                >
                  {s.toFixed(1)}x
                </button>
              ))}
            </div>
          )}
          {!isUser && userId ? <FeedbackButtons messageId={msg.dbId ?? null} userId={userId} /> : null}

        </div>
      </div>
    </div>
  );
});

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm border border-border bg-bot-bubble px-4 py-3 shadow-sm">
        <ChinarLoader size={30} />
        <span className="flex items-center gap-1.5">
          <span className="typing-dot" style={{ animationDelay: "0ms" }} />
          <span className="typing-dot" style={{ animationDelay: "150ms" }} />
          <span className="typing-dot" style={{ animationDelay: "300ms" }} />
        </span>
      </div>
    </div>
  );
}


// Memoized so typing in the composer never re-reconciles the whole thread.
const MessageList = memo(function MessageList({
  messages,
  isThinking,
  onSpeak,
  userId,
  speakingId,
  lang,
  rate,
  onRate,
}: {
  messages: Message[];
  isThinking: boolean;
  onSpeak: (text: string, id: string) => void;
  userId: string;
  speakingId: string | null;
  lang: Lang;
  rate: number;
  onRate: (r: number) => void;
}) {
  return (
    <>
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          msg={m}
          onSpeak={onSpeak}
          userId={userId}
          speaking={speakingId === m.id}
          lang={lang}
          rate={rate}
          onRate={onRate}
        />
      ))}

      {isThinking && <TypingIndicator />}
    </>
  );
});


function rowToMessage(r: ChatMessageRow): Message {
  return {
    id: r.id,
    dbId: r.id,
    role: r.role,
    text: r.content,
    timestamp: new Date(r.created_at).getTime(),
    isRTL: r.is_rtl,
  };
}

export default function KashmirBot({
  session,
  isGuest = false,
  onExitGuest,
}: {
  session: Session | null;
  isGuest?: boolean;
  onExitGuest?: () => void;
}) {
  const userId = session?.user.id ?? "";
  const [guestPrompt, setGuestPrompt] = useState<GuestFeature | null>(null);
  const [lang, setLang] = useState<Lang>("ks");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorderRef = useRef<Recorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutedRef = useRef(muted);
  const t = UI_STRINGS[lang];
  const speakingIdRef = useRef<string | null>(null);
  /** Bumped on every Listen press so stale audio never starts playing. */
  const speakRequestRef = useRef(0);
  const [speechRate, setSpeechRate] = useState(1);
  const speechRateRef = useRef(1);

  const handleRate = useCallback((r: number) => {
    speechRateRef.current = r;
    setSpeechRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }, []);



  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { speakingIdRef.current = speakingId; }, [speakingId]);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  // Warm up the voice list + unlock audio on the first user interaction
  useEffect(() => {
    if (!ttsSupported()) return;
    void getVoices();
    const removeUnlock = installTtsUnlock();
    return () => {
      removeUnlock();
      stopSpeaking();
    };
  }, []);

  // Load sessions list + most recent session's messages
  const refreshSessions = useCallback(async () => {
    if (!userId) return [] as ChatSession[];
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Couldn't load chats");
      return [] as ChatSession[];
    }
    setSessions(data ?? []);
    return data ?? [];
  }, [userId]);

  const loadMessagesFor = useCallback(async (sessionId: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      toast.error("Couldn't load messages");
      return;
    }
    const rows = (data ?? []).slice().reverse();
    setMessages(rows.map(rowToMessage));
  }, [userId]);

  useEffect(() => {
    (async () => {
      const list = await refreshSessions();
      if (list.length > 0) {
        setCurrentSessionId(list[0].id);
        await loadMessagesFor(list[0].id);
      }
    })();
  }, [refreshSessions, loadMessagesFor]);

  // Scroll on message-count change only, in a single rAF, and skip smooth
  // scrolling on low-end / reduced-motion devices where it janks.
  const messageCount = messages.length;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      const smooth =
        typeof window !== "undefined" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
        el.scrollHeight - el.scrollTop - el.clientHeight < 1200;
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
    return () => cancelAnimationFrame(id);
  }, [messageCount, isThinking]);

  const cycleLang = useCallback(() => {
    setLang((l) => LANG_ORDER[(LANG_ORDER.indexOf(l) + 1) % LANG_ORDER.length]);
  }, []);

  const stopAudio = useCallback(() => {
    // Invalidate any in-flight generation so it can't start after we stop.
    speakRequestRef.current += 1;
    const el = audioRef.current;
    if (el) {
      el.pause();
      if (el.src.startsWith("blob:")) URL.revokeObjectURL(el.src);
      audioRef.current = null;
    }
    stopSpeaking();
    speakingIdRef.current = null;
  }, []);


  const handleSpeak = useCallback(async (text: string, id?: string) => {
    // Clicking the speaker of the message already being read stops it.
    if (id && speakingIdRef.current === id) {
      stopAudio();
      setSpeakingId(null);
      return;
    }
    // Pressing Listen on another message always stops what is playing first.
    stopAudio();
    const target = id ?? "auto";
    speakRequestRef.current += 1;
    const requestId = speakRequestRef.current;
    speakingIdRef.current = target;
    setSpeakingId(target);

    // Kashmiri voice from the AI backend — the browser has no koshur voice.
    // Usually already generated by the prefetch below, so this resolves instantly.
    try {
      const { audio, mime } = await getSpeech(text);
      // A newer Listen press (or a stop) happened while this was generating.
      if (speakRequestRef.current !== requestId) return;
      const bytes = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: mime }));
      const el = new Audio(url);
      el.playbackRate = speechRateRef.current;
      audioRef.current = el;
      el.onended = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === el) audioRef.current = null;
        if (speakRequestRef.current === requestId) setSpeakingId(null);
      };
      await el.play();

      return;
    } catch {
      if (speakRequestRef.current !== requestId) return;
      // fall back to the browser voice below
    }


    if (!ttsSupported()) {
      setSpeakingId(null);
      toast.error("آپ کا براؤزر آواز کی سہولت نہیں دیتا");
      return;
    }
    // Unlock TTS if this is the first user-triggered speak. The unlock is
    // awaited inside speak() so we don't race the silent utterance.
    unlockTts();
    const result = await speak(text, {
      onEnd: () => setSpeakingId(null),
      onError: (reason) => {
        setSpeakingId(null);
        if (reason === "unsupported") {
          toast.error("آپ کا براؤزر آواز کی سہولت نہیں دیتا");
        } else if (reason === "blocked" || reason === "not-allowed") {
          toast.error("آواز شروع کرنے کے لیے اسکرین پر ایک بار ٹیپ کریں، پھر اسپیکر دبائیں");
        } else if (reason === "no-audio") {
          toast.error("آواز نہیں چلی — سسٹم کی آواز آن ہے یہ چیک کریں");
        } else if (reason !== "empty") {
          toast.error("آواز چلانے میں مسئلہ ہوا — دوبارہ کوشش کریں");
        }
      },
    });
    if (result !== "ok") setSpeakingId(null);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (next) {
        stopAudio();
        setSpeakingId(null);
      }
      return next;
    });
  }, []);

  const handleMicClick = async () => {
    if (isTranscribing) return;
    if (isListening && recorderRef.current) {
      const rec = recorderRef.current;
      recorderRef.current = null;
      setIsListening(false);
      setIsTranscribing(true);
      try {
        const wav = await rec.stop();
        if (wav.size < 4096) {
          toast("کوئی آواز نہیں سنی گئی");
          return;
        }
        const audio = await blobToBase64(wav);
        const { text } = await transcribeSpeech({ data: { audio } });
        const clean = text.trim();
        if (!clean) {
          toast("کوئی آواز نہیں سنی گئی");
          return;
        }
        setInput("");
        await handleSend(clean);
      } catch (err: any) {
        toast.error("آواز کی شناخت میں مسئلہ", { description: err?.message?.slice(0, 160) });
      } finally {
        setIsTranscribing(false);
      }
      return;
    }
    try {
      recorderRef.current = await startRecording();
      setIsListening(true);
    } catch {
      recorderRef.current = null;
      toast.error("مائیکروفون کی اجازت درکار ہے", {
        description: "Please allow microphone access in your browser settings.",
      });
    }
  };


  const ensureSession = async (firstUserText: string): Promise<string | null> => {
    if (!userId) return null; // guests keep the conversation in memory only
    if (currentSessionId) return currentSessionId;
    const title = firstUserText.slice(0, 60);
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: userId, title })
      .select()
      .single();
    if (error || !data) {
      toast.error("Couldn't start a new chat");
      return null;
    }
    setCurrentSessionId(data.id);
    setSessions((prev) => [data as ChatSession, ...prev]);
    return data.id;
  };

  const persistMessage = async (sessionId: string, msg: Message): Promise<string | null> => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        role: msg.role,
        content: msg.text,
        is_rtl: msg.isRTL,
      })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Couldn't save message");
      return null;
    }
    return data.id as string;
  };

  const callChatBackend = async (
    text: string,
    history: { role: Role; content: string }[],
  ): Promise<{ reply: string; usedFallback: boolean }> => {
    const langMap: Record<Lang, "kashmiri" | "urdu" | "english"> = {
      ks: "kashmiri",
      ur: "urdu",
      en: "english",
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: text, language: langMap[lang], history },
      });
      clearTimeout(timeoutId);
      if (error) throw error;
      const reply = (data as any)?.reply?.trim();
      if (!reply) throw new Error("empty reply");
      return { reply, usedFallback: false };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === "AbortError") {
        toast.error("جواب آنے میں دیر ہو رہی ہے — دوبارہ کوشش کریں");
      }
      return { reply: "", usedFallback: true };
    }
  };


  const sendWithRetry = async (userMsg: Message, sessionId: string | null) => {
    setIsThinking(true);
    const thinkingToast = toast.loading("سوچ رہا ہوں...");
    const history = messagesRef.current.map((m) => ({ role: m.role, content: m.text }));
    history.push({ role: userMsg.role, content: userMsg.text });

    const { reply, usedFallback } = await callChatBackend(userMsg.text, history);
    toast.dismiss(thinkingToast);

    if (usedFallback) {
      // Try the built-in Kashmiri lexicon before showing an error, so the
      // user still gets a relevant answer when the backend is unreachable.
      const offline = localChatReply(userMsg.text);
      if (offline) {
        const offlineMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: offline,
          timestamp: Date.now(),
          isRTL: isRTL(offline),
        };
        setMessages((m) => [...m, offlineMsg]);
        setIsThinking(false);
        if (!mutedRef.current) void handleSpeak(offline, offlineMsg.id);
        if (sessionId) {
          const dbId = await persistMessage(sessionId, offlineMsg);
          if (dbId) setMessages((m) => m.map((x) => (x.id === offlineMsg.id ? { ...x, dbId } : x)));
        }
        return;
      }
      setIsThinking(false);
      toast.error("معاف کریں، کچھ غلطی ہوئی — دوبارہ کوشش کریں", {
        action: {
          label: "Retry",
          onClick: () => sendWithRetry(userMsg, sessionId),
        },
      });
      return;
    }

    const botMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: reply,
      timestamp: Date.now(),
      isRTL: isRTL(reply),
    };
    setMessages((m) => [...m, botMsg]);
    setIsThinking(false);
    if (!mutedRef.current) void handleSpeak(reply, botMsg.id);
    if (sessionId) {
      const dbId = await persistMessage(sessionId, botMsg);
      if (dbId) {
        setMessages((m) => m.map((x) => (x.id === botMsg.id ? { ...x, dbId } : x)));
      }
    }
  };


  const handleAttachClick = () => fileInputRef.current?.click();

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    if (!userId) {
      setGuestPrompt("attachments");
      return;
    }
    const MAX = 20 * 1024 * 1024;
    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > MAX) {
          toast.error(`${file.name}: file too large (max 20MB)`);
          continue;
        }
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${userId}/${currentSessionId ?? "pending"}/${crypto.randomUUID()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("chat-attachments")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) {
          toast.error(`Upload failed: ${file.name}`);
          continue;
        }
        const { data: signed, error: signErr } = await supabase.storage
          .from("chat-attachments")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        if (signErr || !signed) {
          toast.error(`Could not get link for ${file.name}`);
          continue;
        }
        setAttachments((prev) => [...prev, { name: file.name, url: signed.signedUrl, type: file.type }]);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFilesPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    await uploadFiles(files);
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async (override?: string) => {
    const text = (override ?? input).trim();
    if ((!text && attachments.length === 0) || isThinking) return;
    if (isGuest) {
      if (guestLimitReached()) {
        setGuestPrompt("limit");
        return;
      }
      bumpGuestUses();
    }
    const sent = attachments;
    const attachLines = sent.map((a) => `📎 [${a.name}](${a.url})`).join("\n");
    const fullText = [text, attachLines].filter(Boolean).join("\n\n");
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: fullText,
      timestamp: Date.now(),
      isRTL: isRTL(text),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setAttachments([]);

    const sessionId = await ensureSession(text || sent[0]?.name || "Attachment");
    if (sessionId) await persistMessage(sessionId, userMsg);

    // Read any attached images so their text becomes part of the question.
    const images = sent.filter((a) => a.type.startsWith("image/") || IMG_EXT_RE.test(a.name));
    let visionNotes = "";
    if (images.length) {
      setIsThinking(true);
      const reads = await Promise.all(
        images.map(async (img) => {
          try {
            const { text: read } = await readImage({
              data: { imageUrl: img.url, question: text || undefined },
            });
            return read ? `Image "${img.name}":\n${read}` : "";
          } catch {
            return "";
          }
        }),
      );
      visionNotes = reads.filter(Boolean).join("\n\n");
      if (!visionNotes) toast.error("تصویر پڑھی نہیں جا سکی — دوبارہ کوشش کریں");
    }

    const otherFiles = sent.filter((a) => !images.includes(a)).map((a) => a.name);
    const aiText = [
      text,
      visionNotes ? `The user attached image(s). Extracted content:\n${visionNotes}\nAnswer the user's question using this content.` : "",
      otherFiles.length ? `The user also attached file(s): ${otherFiles.join(", ")}.` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const aiMsg: Message = { ...userMsg, text: aiText || "(user sent an attachment)" };
    await sendWithRetry(aiMsg, sessionId);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleSelectSession = useCallback(async (id: string) => {
    setCurrentSessionId(id);
    await loadMessagesFor(id);
  }, [loadMessagesFor]);

  const handleNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
  }, []);

  const handleRenameSession = useCallback(async (id: string, title: string) => {
    const { error } = await supabase
      .from("chat_sessions")
      .update({ title })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      toast.error("Couldn't rename chat");
      return;
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s)),
    );
  }, [userId]);

  const handleDeleteSession = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      toast.error("Couldn't delete chat");
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setCurrentSessionId((cur) => {
      if (cur === id) {
        setMessages([]);
        return null;
      }
      return cur;
    });
    toast.success("Chat deleted");
  }, [userId]);

  const handleSignOut = async () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    await supabase.auth.signOut();
  };

  const inputIsRTL = isRTL(input) || lang !== "en";

  return (
    <div
      className="relative flex h-[100dvh] flex-col bg-background"
      onDragEnter={(e) => {
        if (!e.dataTransfer?.types?.includes("Files")) return;
        e.preventDefault();
        dragCounter.current += 1;
        setIsDragging(true);
      }}
      onDragOver={(e) => {
        if (!e.dataTransfer?.types?.includes("Files")) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(e) => {
        if (!e.dataTransfer?.types?.includes("Files")) return;
        dragCounter.current = Math.max(0, dragCounter.current - 1);
        if (dragCounter.current === 0) setIsDragging(false);
      }}
      onDrop={(e) => {
        if (!e.dataTransfer?.types?.includes("Files")) return;
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length) void uploadFiles(files);
      }}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
          <div className="m-4 flex flex-col items-center gap-3 rounded-3xl border-4 border-dashed border-primary bg-card/95 px-10 py-12 shadow-2xl">
            <Paperclip className="h-12 w-12 text-primary" />
            <p className="text-xl font-semibold text-foreground">Drop files to attach</p>
            <p className="font-nastaliq text-lg text-muted-foreground" dir="rtl">
              فائل یہاں چھوڑیں
            </p>
          </div>
        </div>
      )}
      {guestPrompt && (
        <GuestPrompt feature={guestPrompt} onDismiss={() => setGuestPrompt(null)} />
      )}
      <Suspense fallback={null}>
        <SessionsPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelect={handleSelectSession}
          onNew={handleNewChat}
          onRename={handleRenameSession}
          onDelete={handleDeleteSession}
        />
      </Suspense>

      {/* Header */}
      <header className="border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-3 py-3 sm:px-4 lg:max-w-4xl xl:max-w-5xl">
          {/* Signature Kashmiri Wordmark */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => (isGuest ? setGuestPrompt("sessions") : setPanelOpen(true))}
              aria-label="Previous chats"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center sm:flex">
              <img src="/chinar-leaf.jpg" alt="Chinar Leaf" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="font-nastaliq truncate text-2xl sm:text-3xl text-foreground leading-normal" dir="rtl">
                کٲشُر مددگار
              </h1>
              <p className="truncate text-xs sm:text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>

          {/* Clean, 2-3 Action Cluster with Labels */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/translate"
              aria-label="Learn Kashmiri translator"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Languages className="h-4 w-4 shrink-0 text-primary" />
              <span className="hidden sm:inline">Learn</span>
            </Link>

            <button
              onClick={cycleLang}
              aria-label="Switch language"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <span className={lang === "ks" ? "font-nastaliq text-sm" : ""}>{t.langLabel}</span>
            </button>

            <ThemeToggle />

            {/* Menu Drawer Toggle / Secondary Actions Menu */}
            <div className="relative">
              <button
                onClick={toggleMute}
                aria-label={muted ? "Unmute auto-read" : "Mute auto-read"}
                aria-pressed={muted}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                title={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>

            <button
              onClick={isGuest ? onExitGuest : handleSignOut}
              aria-label={isGuest ? "Sign in" : "Sign out"}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline">{isGuest ? "Sign in" : "Sign out"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] [contain:layout_paint] [transform:translateZ(0)]"
      >
        <div className="mx-auto flex w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl flex-col gap-3 xs:gap-4 md:gap-5 px-2 xs:px-3 sm:px-4 md:px-6 py-3 xs:py-4 sm:py-6">
          {messages.length === 0 && !isThinking ? (
            <div className="flex min-h-[50vh] xs:min-h-[60vh] flex-col items-center justify-center text-center px-4">
              <div className="mb-4 xs:mb-6 flex h-20 w-20 xs:h-24 xs:w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 items-center justify-center">
                <img src="/chinar-leaf.jpg" alt="Chinar Leaf" className="h-full w-full object-contain drop-shadow-lg" />
              </div>
              <p
                dir={t.emptyDir}
                className={`max-w-md text-xl xs:text-2xl sm:text-3xl md:text-4xl text-foreground ${t.emptyClass}`}
              >
                {t.empty}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/contribute"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-accent"
                >
                  <HeartHandshake className="h-4 w-4 text-primary" />
                  <span>Contribute (دیو مدد)</span>
                </Link>
              </div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              isThinking={isThinking}
              onSpeak={handleSpeak}
              userId={userId}
              speakingId={speakingId}
              lang={lang}
              rate={speechRate}
              onRate={handleRate}

            />
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-3 sm:py-4">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5 xs:gap-2">
              {attachments.map((a, i) => {
                const isImg = a.type.startsWith("image/") || IMG_EXT_RE.test(a.name);
                return (
                  <div
                    key={i}
                    className="group relative flex items-center gap-1.5 xs:gap-2 rounded-lg border border-border bg-secondary/60 px-1.5 xs:px-2 py-1 xs:py-1.5 text-xs xs:text-sm"
                  >
                    {isImg ? (
                      <img src={a.url} alt={a.name} className="h-6 w-6 xs:h-8 xs:w-8 rounded object-cover" />
                    ) : (
                      <FileText className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground" />
                    )}
                    <span className="max-w-[100px] xs:max-w-[140px] truncate">{a.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      aria-label={`Remove ${a.name}`}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                    >
                      <X className="h-3 w-3 xs:h-4 xs:w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-end gap-1.5 xs:gap-2 sm:gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              className="hidden"
              onChange={handleFilesPicked}
            />
            <button
              type="button"
              onClick={handleAttachClick}
              disabled={uploading}
              aria-label="Attach file"
              title="Attach file"
              className="flex min-h-[44px] min-w-[44px] h-11 w-11 xs:h-12 xs:w-12 shrink-0 items-center justify-center rounded-[8px] border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
            </button>
            <div className="relative shrink-0">
              {isListening && <span className="mic-listening-ring" aria-hidden="true" />}
              <button
                type="button"
                onClick={handleMicClick}
                aria-label={t.mic}
                aria-pressed={isListening}
                className={[
                  "flex min-h-[44px] min-w-[44px] h-11 w-11 xs:h-12 xs:w-12 items-center justify-center rounded-[8px] border border-border bg-secondary text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                  isListening ? "mic-listening" : "",
                ].join(" ")}
              >
                {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t.placeholder}
              dir={inputIsRTL ? "rtl" : "ltr"}
              rows={1}
              enterKeyHint="send"
              autoCapitalize="sentences"
              autoCorrect="on"
              spellCheck={false}
              className={[
                "min-h-[44px] max-h-32 flex-1 resize-none rounded-[8px] border border-border bg-background px-3 py-2.5 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                inputIsRTL ? "font-nastaliq" : "",
              ].join(" ")}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={(!input.trim() && attachments.length === 0) || isThinking || uploading}
              aria-label={t.send}
              className="flex min-h-[44px] min-w-[44px] h-11 w-11 xs:h-12 xs:w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
