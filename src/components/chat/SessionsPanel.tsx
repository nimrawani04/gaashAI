import { useEffect, useState, useRef } from "react";
import { X, Plus, Pencil, Check } from "lucide-react";
import type { ChatSession } from "@/lib/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, newTitle: string) => void | Promise<void>;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function groupByDate(sessions: ChatSession[]) {
  const groups: Record<string, ChatSession[]> = {};
  for (const s of sessions) {
    const key = formatDate(s.created_at);
    (groups[key] ||= []).push(s);
  }
  return Object.entries(groups);
}

export default function SessionsPanel({
  open,
  onClose,
  sessions,
  currentSessionId,
  onSelect,
  onNew,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col border-r border-border bg-card shadow-2xl transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Previous chats"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold text-foreground">Previous chats</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <button
          onClick={() => {
            onNew();
            onClose();
          }}
          className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>

        <div className="mt-4 flex-1 overflow-y-auto px-2 pb-4">
          {sessions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No previous chats yet.
            </p>
          ) : (
            groupByDate(sessions).map(([date, items]) => (
              <div key={date} className="mb-4">
                <div className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {date}
                </div>
                <ul className="flex flex-col gap-1">
                  {items.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => {
                          onSelect(s.id);
                          onClose();
                        }}
                        className={`w-full truncate rounded-xl px-3 py-2 text-left text-sm transition ${
                          s.id === currentSessionId
                            ? "bg-secondary text-foreground"
                            : "text-foreground/80 hover:bg-secondary"
                        }`}
                      >
                        {s.title || "Untitled chat"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
