ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS embedding_large extensions.vector(1536);
CREATE OR REPLACE FUNCTION public.match_knowledge_large(query_embedding extensions.vector, match_threshold double precision DEFAULT 0.3, match_count integer DEFAULT 5)
RETURNS TABLE(id uuid, title text, content_kashmiri text, content_urdu text, content_english text, category text, similarity double precision)
LANGUAGE sql STABLE SET search_path TO 'public', 'extensions'
AS $$
  select kb.id, kb.title, kb.content_kashmiri, kb.content_urdu, kb.content_english, kb.category,
         1 - (kb.embedding_large <=> query_embedding) as similarity
  from public.knowledge_base kb
  where kb.embedding_large is not null
    and 1 - (kb.embedding_large <=> query_embedding) > match_threshold
  order by kb.embedding_large <=> query_embedding
  limit match_count
$$;