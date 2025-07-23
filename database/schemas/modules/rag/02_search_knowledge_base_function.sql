-- RAG Search Function for Knowledge Base
-- This function performs vector similarity search for the complaint RAG processor
-- Used by N8N workflow: complaint-rag-processor.json

CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(768),
  tenant_filter text,
  similarity_threshold float DEFAULT 0.7,
  max_results int DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  contenido text,
  similarity float,
  metadata jsonb,
  documento_id uuid,
  chunk_index int
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.contenido,
    (1 - (dc.embedding <=> query_embedding)) as similarity,
    dc.metadata,
    dc.documento_id,
    dc.chunk_index
  FROM documento_chunks dc
  INNER JOIN documentos_conocimiento dk ON dc.documento_id = dk.id
  WHERE dk.concesionario_id = tenant_filter::uuid
    AND (1 - (dc.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION search_knowledge_base TO service_role;
GRANT EXECUTE ON FUNCTION search_knowledge_base TO authenticated;