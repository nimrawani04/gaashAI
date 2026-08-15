CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.translation_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  en text NOT NULL,
  ks text NOT NULL,
  domain text NOT NULL DEFAULT 'general',
  source text NOT NULL DEFAULT 'BPCC',
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS translation_pairs_en_uidx ON public.translation_pairs (md5(en), source);

GRANT SELECT ON public.translation_pairs TO anon;
GRANT SELECT ON public.translation_pairs TO authenticated;
GRANT ALL ON public.translation_pairs TO service_role;

ALTER TABLE public.translation_pairs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Translation pairs are publicly readable" ON public.translation_pairs;
CREATE POLICY "Translation pairs are publicly readable"
  ON public.translation_pairs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS translation_pairs_embedding_idx
  ON public.translation_pairs USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_translation_pairs(
  query_embedding vector(1536),
  match_count int DEFAULT 5
)
RETURNS TABLE (id uuid, en text, ks text, domain text, similarity float)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT t.id, t.en, t.ks, t.domain,
         1 - (t.embedding <=> query_embedding) AS similarity
  FROM public.translation_pairs t
  WHERE t.embedding IS NOT NULL
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_translation_pairs(vector, int) TO anon, authenticated, service_role;