-- Create the search_knowledge_base function for RAG processor
-- This function performs vector similarity search on documento_chunks table
-- with tenant isolation and returns relevant content for knowledge base queries

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
GRANT EXECUTE ON FUNCTION search_knowledge_base TO authenticated;
GRANT EXECUTE ON FUNCTION search_knowledge_base TO service_role;

-- Create an index on embeddings for better performance if it doesn't exist
-- This will improve search performance significantly
CREATE INDEX IF NOT EXISTS idx_documento_chunks_embedding 
ON documento_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add comment for documentation
COMMENT ON FUNCTION search_knowledge_base IS 
'Performs vector similarity search on documento_chunks table with tenant isolation. 
Used by the RAG processor in complaint-rag-processor.json workflow.
Parameters:
- query_embedding: 768-dimensional vector from Gemini embedding
- tenant_filter: concesionario_id as text (converted to UUID)
- similarity_threshold: minimum similarity score (default 0.7)
- max_results: maximum number of results to return (default 10)
Returns: id, content, similarity score, metadata, document_id, chunk_index';