// Supabase Edge Function: embed
// Deploy: `supabase functions deploy embed --no-verify-jwt`
// Uses the FREE built-in Supabase AI gte-small model (384 dims). No API key required.
//
// ---------------------------------------------------------------------------
// One-time SQL setup (run in Supabase SQL editor):
//
// CREATE EXTENSION IF NOT EXISTS vector;
//
// CREATE TABLE IF NOT EXISTS knowledge_base (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   title text NOT NULL,
//   content_kashmiri text,
//   content_english text NOT NULL,
//   source text,
//   category text CHECK (category IN ('health','government','agriculture','general')),
//   created_at timestamptz DEFAULT now(),
//   embedding vector(384)
// );
//
// CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx
//   ON knowledge_base USING ivfflat (embedding vector_cosine_ops);
//
// GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_base TO authenticated;
// GRANT SELECT ON public.knowledge_base TO anon;
// GRANT ALL    ON public.knowledge_base TO service_role;
// ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "kb read all"  ON public.knowledge_base FOR SELECT TO anon, authenticated USING (true);
// CREATE POLICY "kb write auth" ON public.knowledge_base FOR ALL    TO authenticated USING (true) WITH CHECK (true);
//
// CREATE OR REPLACE FUNCTION match_knowledge(
//   query_embedding vector(384),
//   match_threshold float,
//   match_count int
// )
// RETURNS TABLE(title text, content_english text, content_kashmiri text, similarity float)
// LANGUAGE sql STABLE
// AS $$
//   SELECT title, content_english, content_kashmiri,
//     1 - (embedding <=> query_embedding) AS similarity
//   FROM knowledge_base
//   WHERE embedding IS NOT NULL
//     AND 1 - (embedding <=> query_embedding) > match_threshold
//   ORDER BY similarity DESC
//   LIMIT match_count;
// $$;
//
// ---------------------------------------------------------------------------
// Community feedback + contributions tables (run in SQL editor):
//
// CREATE TABLE IF NOT EXISTS public.feedback (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
//   rating smallint NOT NULL CHECK (rating IN (1, -1)),
//   correction_text text,
//   user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
//   created_at timestamptz NOT NULL DEFAULT now()
// );
// CREATE INDEX IF NOT EXISTS feedback_message_id_idx ON public.feedback(message_id);
// GRANT SELECT, INSERT ON public.feedback TO authenticated;
// GRANT ALL ON public.feedback TO service_role;
// ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "feedback insert own" ON public.feedback FOR INSERT TO authenticated
//   WITH CHECK (auth.uid() = user_id);
// CREATE POLICY "feedback read own"   ON public.feedback FOR SELECT TO authenticated
//   USING (auth.uid() = user_id);
//
// CREATE TABLE IF NOT EXISTS public.contributions (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   kashmiri_text text NOT NULL,
//   english_meaning text NOT NULL,
//   category text,
//   submitted_by_name text,
//   verified boolean NOT NULL DEFAULT false,
//   created_at timestamptz NOT NULL DEFAULT now()
// );
// GRANT SELECT, INSERT ON public.contributions TO anon, authenticated;
// GRANT UPDATE, DELETE ON public.contributions TO authenticated;
// GRANT ALL            ON public.contributions TO service_role;
// ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "contrib insert any" ON public.contributions FOR INSERT TO anon, authenticated WITH CHECK (true);
// CREATE POLICY "contrib read any"   ON public.contributions FOR SELECT TO anon, authenticated USING (true);
// CREATE POLICY "contrib update auth" ON public.contributions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
// CREATE POLICY "contrib delete auth" ON public.contributions FOR DELETE TO authenticated USING (true);
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// deno-lint-ignore no-explicit-any
declare const Supabase: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const session = new Supabase.ai.Session("gte-small");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, knowledge_id } = await req.json();
    if (!text || !knowledge_id) {
      return new Response(JSON.stringify({ error: "text and knowledge_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const embedding = await session.run(text, { mean_pool: true, normalize: true });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase
      .from("knowledge_base")
      .update({ embedding })
      .eq("id", knowledge_id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
