import { useEffect, useRef, useState } from "react";
import { X, Plus, Pencil, Check, Trash2, AlertTriangle } from "lucide-react";
import type { ChatSession } from "@/lib/supabase";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, newTitle: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
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
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastRenameId = useRef<string | null>(null);
  const lastDeleteId = useRef<string | null>(null);

  const sessionToDelete =
    sessions.find((s) => s.id === confirmDeleteId) ?? null;

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setDraft("");
      setConfirmDeleteId(null);
    }
  }, [open]);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  // Return focus to the rename trigger when editing ends.
  useEffect(() => {
    if (!editingId && lastRenameId.current) {
      const el = document.getElementById(`rename-btn-${lastRenameId.current}`);
      if (el) el.focus();
      lastRenameId.current = null;
    }
  }, [editingId]);

  // Return focus to the delete trigger when the delete dialog closes.
  useEffect(() => {
    if (!confirmDeleteId && lastDeleteId.current) {
      const el = document.getElementById(`delete-btn-${lastDeleteId.current}`);
      if (el) el.focus();
      lastDeleteId.current = null;
    }
  }, [confirmDeleteId]);

  useEffect(() => {
    if (!open || confirmDeleteId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, confirmDeleteId]);

  const startEdit = (s: ChatSession) => {
    lastRenameId.current = s.id;
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

  const requestDelete = (id: string) => {
    lastDeleteId.current = id;
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await onDelete(confirmDeleteId);
    setConfirmDeleteId(null);
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
          <h2 className="text-lg font-semibold text-foreground">
            Previous chats
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close previous chats"
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        <Button
          onClick={() => {
            onNew();
            onClose();
          }}
          className="mx-4 mt-4 gap-2 rounded-full"
        >
          <Plus className="h-4 w-4" /> New chat
        </Button>

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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => submitEdit(s.id)}
                            aria-label="Save chat name"
                            className="h-7 w-7 rounded-full shrink-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEdit}
                            aria-label="Cancel rename"
                            className="h-7 w-7 rounded-full shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
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
                            aria-current={
                              s.id === currentSessionId ? "true" : undefined
                            }
                            className="min-w-0 flex-1 truncate rounded-lg px-1 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {s.title || "Untitled chat"}
                          </button>
                          <Button
                            id={`rename-btn-${s.id}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(s)}
                            aria-label={`Rename chat: ${
                              s.title || "Untitled chat"
                            }`}
                            className="h-7 w-7 shrink-0 rounded-full opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            id={`delete-btn-${s.id}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => requestDelete(s.id)}
                            aria-label={`Delete chat: ${
                              s.title || "Untitled chat"
                            }`}
                            className="h-7 w-7 shrink-0 rounded-full opacity-0 transition hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(isOpen) => !isOpen && setConfirmDeleteId(null)}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove "
                  {sessionToDelete?.title || "Untitled chat"}" and all its
                  messages.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
