import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { askLesson, type Lesson } from "@/lib/learn.functions";

type ChatMsg = { id: string; role: "user" | "assistant"; content: string; at: number };

const STORE_PREFIX = "kb-lesson-chat:";
const MAX_KEPT = 60;

/** Stable per-lesson key so reopening the same lesson restores its history. */
export function lessonChatKey(lesson: Lesson, grade: number, language: string) {
  return `${language}|g${grade}|${lesson.title.trim().toLowerCase()}`;
}

function load(key: string): ChatMsg[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_PREFIX + key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ChatMsg[]) : [];
  } catch {
    return [];
  }
}

function save(key: string, msgs: ChatMsg[]) {
  try {
    window.localStorage.setItem(STORE_PREFIX + key, JSON.stringify(msgs.slice(-MAX_KEPT)));
  } catch {
    /* storage full or blocked — chat still works for this visit */
  }
}

export function LessonChat({
  lesson,
  grade,
  subject,
  language,
  rtl,
}: {
  lesson: Lesson;
  grade: number;
  subject: string;
  language: "kashmiri" | "urdu";
  rtl: boolean;
}) {
  const ask = useServerFn(askLesson);
  const storeKey = lessonChatKey(lesson, grade, language);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Restore this lesson's earlier questions and answers.
  useEffect(() => {
    setMessages(load(storeKey));
  }, [storeKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length, busy]);

  async function send() {
    const question = input.trim();
    if (!question || busy) return;

    const mine: ChatMsg = { id: `u${Date.now()}`, role: "user", content: question, at: Date.now() };
    const next = [...messages, mine];
    setMessages(next);
    save(storeKey, next);
    setInput("");
    setBusy(true);

    try {
      const context = lesson.concepts
        .map((c) => `${c.name_en} (${c.name_target}): ${c.simplified_en} | ${c.explanation_target}`)
        .join("\n")
        .slice(0, 7000);

      const answer = await ask({
        data: {
          question,
          lessonTitle: lesson.title,
          grade,
          subject,
          language,
          context,
          history: next.slice(-8).map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
        },
      });

      const reply: ChatMsg = { id: `a${Date.now()}`, role: "assistant", content: answer, at: Date.now() };
      const withReply = [...next, reply];
      setMessages(withReply);
      save(storeKey, withReply);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not answer that right now.");
    } finally {
      setBusy(false);
    }
  }

  function clearAll() {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORE_PREFIX + storeKey);
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
          <MessageCircle className="h-4 w-4 text-primary" />
          Ask about this lesson
        </h3>
        {messages.length > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground hover:bg-accent"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Saved on this device — your earlier questions come back when you reopen this lesson.
      </p>

      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            No questions yet. Ask anything about this lesson in your own words.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[92%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            } ${m.role === "assistant" && rtl ? "font-nastaliq" : ""}`}
            dir={m.role === "assistant" && rtl ? "rtl" : "auto"}
          >
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={2}
          placeholder="Type your question…"
          className="min-h-[44px] flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <button
          onClick={() => void send()}
          disabled={busy || !input.trim()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Ask
        </button>
      </div>
    </section>
  );
}
