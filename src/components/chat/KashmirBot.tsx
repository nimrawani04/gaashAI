import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, Send, Volume2, VolumeX, LogOut, Menu, HeartHandshake, Paperclip, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase, type ChatSession, type ChatMessageRow } from "@/lib/supabase";
import SessionsPanel from "@/components/chat/SessionsPanel";
import FeedbackButtons from "@/components/chat/FeedbackButtons";
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

function MessageBubble({
  msg,
  onSpeak,
  userId,
}: {
  msg: Message;
  onSpeak: (text: string) => void;
  userId: string;
}) {
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
          {renderMessageContent(msg.text)}
        </div>
        {!isUser && (
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => onSpeak(msg.text.replace(/^📎 \[.+?\]\(.+?\)$/gm, "").trim())}
              aria-label="Read aloud"
              className="ms-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <FeedbackButtons messageId={msg.dbId ?? null} userId={userId} />
          </div>
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

export default function KashmirBot({ session }: { session: Session }) {
  const userId = session.user.id;
  const [lang, setLang] = useState<Lang>("ks");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [muted, setMuted] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutedRef = useRef(muted);
  const t = UI_STRINGS[lang];

  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // Load voices
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

  // Load sessions list + most recent session's messages
  const refreshSessions = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    (async () => {
      const list = await refreshSessions();
      if (list.length > 0) {
        setCurrentSessionId(list[0].id);
        await loadMessagesFor(list[0].id);
      }
    })();
  }, [refreshSessions, loadMessagesFor]);

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
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
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
      if (transcript) setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch { setIsListening(false); recognitionRef.current = null; }
  };

  const ensureSession = async (firstUserText: string): Promise<string | null> => {
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
    const history = messages.map((m) => ({ role: m.role, content: m.text }));
    history.push({ role: userMsg.role, content: userMsg.text });

    const { reply, usedFallback } = await callChatBackend(userMsg.text, history);
    toast.dismiss(thinkingToast);

    if (usedFallback) {
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
    if (!mutedRef.current) speak(reply);
    if (sessionId) {
      const dbId = await persistMessage(sessionId, botMsg);
      if (dbId) {
        setMessages((m) => m.map((x) => (x.id === botMsg.id ? { ...x, dbId } : x)));
      }
    }
  };


  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFilesPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
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

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || isThinking) return;
    const attachLines = attachments.map((a) => `📎 [${a.name}](${a.url})`).join("\n");
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

    const sessionId = await ensureSession(text || attachments[0]?.name || "Attachment");
    if (sessionId) await persistMessage(sessionId, userMsg);

    // Send only the text portion to the AI (it can't see the files)
    const aiMsg: Message = { ...userMsg, text: text || "(user sent an attachment)" };
    await sendWithRetry(aiMsg, sessionId);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectSession = async (id: string) => {
    setCurrentSessionId(id);
    await loadMessagesFor(id);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleRenameSession = async (id: string, title: string) => {
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
  };

  const handleDeleteSession = async (id: string) => {
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
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
    toast.success("Chat deleted");
  };

  const handleSignOut = async () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    await supabase.auth.signOut();
  };

  const inputIsRTL = isRTL(input) || lang !== "en";

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
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

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2 min-w-0 sm:gap-3">
            <button
              onClick={() => setPanelOpen(true)}
              aria-label="Previous chats"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md sm:flex">
              <span className="font-nastaliq text-2xl leading-none">ک</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-nastaliq truncate text-2xl text-foreground sm:text-3xl" dir="rtl">
                کٲشُر مددگار
              </h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{t.subtitle}</p>
              <span
                title="Active AI backend: Lovable AI (fallbacks disabled)"
                className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Lovable AI
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/contribute"
              aria-label="Contribute"
              title="دیو مدد"
              className="hidden h-10 items-center gap-1.5 rounded-full border border-border bg-secondary px-3 text-sm font-semibold text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:inline-flex"
            >
              <HeartHandshake className="h-4 w-4" />
              <span className="font-nastaliq text-base">دیو مدد</span>
            </Link>
            <Link
              to="/contribute"
              aria-label="Contribute"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:hidden"
            >
              <HeartHandshake className="h-5 w-5" />
            </Link>
            <button
              onClick={toggleMute}
              aria-label={muted ? "Unmute auto-read" : "Mute auto-read"}
              aria-pressed={muted}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button
              onClick={cycleLang}
              aria-label="Switch language"
              className="rounded-full border border-border bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <span className={lang === "ks" ? "font-nastaliq text-lg" : ""}>{t.langLabel}</span>
            </button>
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <LogOut className="h-5 w-5" />
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
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <MessageBubble key={m.id} msg={m} onSpeak={handleSpeak} userId={userId} />
              ))}
              {isThinking && <TypingIndicator />}
            </>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:py-4">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((a, i) => {
                const isImg = a.type.startsWith("image/") || IMG_EXT_RE.test(a.name);
                return (
                  <div
                    key={i}
                    className="group relative flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-2 py-1.5 text-sm"
                  >
                    {isImg ? (
                      <img src={a.url} alt={a.name} className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="max-w-[140px] truncate">{a.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      aria-label={`Remove ${a.name}`}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-end gap-2 sm:gap-3">
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
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Paperclip className="h-6 w-6" />}
            </button>
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
              disabled={(!input.trim() && attachments.length === 0) || isThinking || uploading}
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
