import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getBpccStats, ingestBpcc } from "@/lib/bpcc.functions";

export default function BpccPanel() {
  const stats = useServerFn(getBpccStats);
  const ingest = useServerFn(ingestBpcc);
  const [total, setTotal] = useState<number | null>(null);
  const [embedded, setEmbedded] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    try {
      const s = await stats({});
      setTotal(s.total);
      setEmbedded(s.embedded);
    } catch {
      setTotal(null);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleIngest() {
    setBusy(true);
    setMsg("Embedding BPCC pairs… this can take a minute.");
    try {
      const r = await ingest({ data: {} });
      setMsg(`✓ Imported ${r.inserted} new pairs (${r.skipped} already present).`);
      await refresh();
    } catch (err) {
      setMsg("Error: " + String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 xs:mb-8 rounded-lg border bg-card p-4 xs:p-5 sm:p-6">
      <h2 className="mb-1 text-base xs:text-lg sm:text-xl font-semibold">
        BPCC translation corpus
      </h2>
      <p className="mb-3 text-xs xs:text-sm text-muted-foreground">
        Human-verified English ⇄ Kashmiri sentence pairs from the Bharat Parallel Corpus
        Collection. The translator retrieves the closest pairs and uses them as examples.
      </p>
      <p className="mb-3 text-xs xs:text-sm">
        Stored: <strong>{total ?? "…"}</strong> · with embeddings:{" "}
        <strong>{embedded ?? "…"}</strong>
      </p>
      <button
        type="button"
        onClick={handleIngest}
        disabled={busy}
        className="rounded-md bg-primary px-4 py-2 text-xs xs:text-sm sm:text-base font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? "Importing…" : "Import / refresh BPCC pairs"}
      </button>
      {msg && <p className="mt-2 text-xs xs:text-sm text-muted-foreground">{msg}</p>}
    </section>
  );
}
