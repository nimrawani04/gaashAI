import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const IngestInput = z.object({ limit: z.number().int().min(1).max(5000).optional() });

export const getBpccStats = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("translation_pairs")
    .select("id", { count: "exact", head: true });
  const { count: embedded } = await supabaseAdmin
    .from("translation_pairs")
    .select("id", { count: "exact", head: true })
    .not("embedding", "is", null);
  return { total: count ?? 0, embedded: embedded ?? 0 };
});

export const ingestBpcc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IngestInput.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isStaff = (roles ?? []).some(
      (r: { role: string }) => r.role === "admin" || r.role === "moderator",
    );
    if (!isStaff) throw new Error("Forbidden: admin or moderator role required");

    const { ingestBpccCorpus } = await import("@/lib/bpcc.server");
    return await ingestBpccCorpus(data.limit);
  });
