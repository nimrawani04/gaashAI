import { useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Props {
  messageId: string | null; // DB id; null if message not yet persisted
  userId: string;
}

type State = "idle" | "up" | "down" | "submitted-down";

export default function FeedbackButtons({ messageId, userId }: Props) {
  const [state, setState] = useState<State>("idle");
  const [open, setOpen] = useState(false);
  const [correction, setCorrection] = useState("");
  const [busy, setBusy] = useState(false);

  if (!messageId) return null;

  const submitRating = async (rating: 1 | -1, correction_text?: string) => {
    setBusy(true);
    const { error } = await supabase.from("feedback").insert({
      message_id: messageId,
      rating,
      correction_text: correction_text ?? null,
      user_id: userId,
    });
    setBusy(false);
    if (error) {
      toast.error("Couldn't save feedback");
      return false;
    }
    return true;
  };

  const handleUp = async () => {
    if (state !== "idle") return;
    const ok = await submitRating(1);
    if (ok) {
      setState("up");
      toast.success("شکریہ!");
    }
  };

  const handleDownClick = () => {
    if (state !== "idle") return;
    setOpen(true);
    setState("down");
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitRating(-1, correction.trim() || undefined);
    if (ok) {
      setOpen(false);
      setState("submitted-down");
      toast.success("شکریہ! آپ کا تبصرہ محفوظ ہوگیا");
    }
  };

  return (
    <div className="ms-1 flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleUp}
          disabled={state !== "idle" || busy}
          aria-label="Helpful"
          className={[
            "inline-flex items-center justify-center rounded-full p-1.5 text-xs transition focus:outline-none focus:ring-2 focus:ring-ring",
            state === "up"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          ].join(" ")}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDownClick}
          disabled={state !== "idle" || busy}
          aria-label="Not helpful"
          className={[
            "inline-flex items-center justify-center rounded-full p-1.5 text-xs transition focus:outline-none focus:ring-2 focus:ring-ring",
            state === "down" || state === "submitted-down"
              ? "bg-destructive/10 text-destructive"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          ].join(" ")}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <form
          onSubmit={handleSubmitCorrection}
          className="w-72 rounded-xl border border-border bg-card p-3 shadow-md"
        >
          <label
            dir="rtl"
            className="font-nastaliq mb-2 block text-sm text-foreground"
          >
            صحیح جواب کیا ہونا چاہیے؟
          </label>
          <textarea
            dir="rtl"
            rows={3}
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            className="font-nastaliq w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="..."
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setState("idle");
              }}
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {busy && <Loader2 className="h-3 w-3 animate-spin" />}
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
