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
  onRename,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setDraft("");
    }
  }, [open]);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const startEdit = (s: ChatSession) => {
    setEditingId(s.id);
    setDraft(s.title || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const submitEdit = async (id: string) => {
    const trimmed = draft.trim();
    if (trimmed) {
      await onRename(id, trimmed);
    }
    setEditingId(null);
    setDraft("");
  };

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
                      {editingId === s.id ? (
                        <div className="flex items-center gap-1 rounded-xl bg-secondary px-2 py-1.5">
                          <input
                            ref={inputRef}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") submitEdit(s.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label="Rename chat"
                          />
                          <button
                            onClick={() => submitEdit(s.id)}
                            aria-label="Save name"
                            className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            aria-label="Cancel rename"
                            className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`group flex items-center gap-1 rounded-xl px-2 transition ${
                            s.id === currentSessionId
                              ? "bg-secondary text-foreground"
                              : "text-foreground/80 hover:bg-secondary"
                          }`}
                        >
                          <button
                            onClick={() => {
                              onSelect(s.id);
                              onClose();
                            }}
                            className="min-w-0 flex-1 truncate px-1 py-2 text-left text-sm"
                          >
                            {s.title || "Untitled chat"}
                          </button>
                          <button
                            onClick={() => startEdit(s)}
                            aria-label="Rename chat"
                            className="shrink-0 rounded-full p-1.5 opacity-0 text-muted-foreground transition hover:bg-background hover:text-foreground group-hover:opacity-100 focus:opacity-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
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
