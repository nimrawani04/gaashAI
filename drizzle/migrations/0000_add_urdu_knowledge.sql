ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS content_urdu text NOT NULL DEFAULT '';

DROP FUNCTION IF EXISTS public.match_knowledge(extensions.vector, double precision, integer);

CREATE FUNCTION public.match_knowledge(query_embedding extensions.vector, match_threshold double precision DEFAULT 0.3, match_count integer DEFAULT 5)
 RETURNS TABLE(id uuid, title text, content_kashmiri text, content_urdu text, content_english text, category text, similarity double precision)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'extensions'
AS $function$
  select kb.id, kb.title, kb.content_kashmiri, kb.content_urdu, kb.content_english, kb.category,
         1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where kb.embedding is not null
    and 1 - (kb.embedding <=> query_embedding) > match_threshold
  order by kb.embedding <=> query_embedding
  limit match_count
$function$;

GRANT EXECUTE ON FUNCTION public.match_knowledge(extensions.vector, double precision, integer) TO anon, authenticated, service_role;