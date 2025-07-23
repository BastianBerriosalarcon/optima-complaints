# RAG Search Function Deployment Summary

## What was created

The `search_knowledge_base` function has been successfully created and is ready for deployment to enable RAG (Retrieval Augmented Generation) functionality in the complaint processing system.

## Files Created

1. **`/home/bastianberrios_a/database/schemas/modules/rag/02_search_knowledge_base_function.sql`**
   - The main SQL function for vector similarity search
   - Includes proper permissions for service_role and authenticated users

2. **`/home/bastianberrios_a/database/schemas/modules/rag/README.md`**
   - Comprehensive documentation for the RAG system
   - Usage instructions and deployment options

3. **`/home/bastianberrios_a/database/schemas/modules/rag/DEPLOYMENT_SUMMARY.md`**
   - This summary document

## Function Details

**Function Name:** `search_knowledge_base`

**Parameters:**
- `query_embedding` (vector(768)): Gemini embedding vector
- `tenant_filter` (text): Concesionario ID for multi-tenant filtering
- `similarity_threshold` (float, default 0.7): Minimum similarity score
- `max_results` (int, default 10): Maximum results to return

**Returns:** Table with columns: id, contenido, similarity, metadata, documento_id, chunk_index

## N8N Integration

The function is already integrated into the complaint RAG processor workflow:
- **File:** `/home/bastianberrios_a/applications/n8n-workflows/reclamos/complaint-rag-processor.json`
- **Node:** "Vector Search" (line 140)
- **URL:** `{{ $vars.SUPABASE_URL }}/rest/v1/rpc/search_knowledge_base`

## Deployment Instructions

### ⚠️ IMMEDIATE ACTION REQUIRED

Due to network restrictions in the current Cloud Shell environment, the function needs to be deployed manually:

### Option 1: Supabase Dashboard (RECOMMENDED)

1. **Navigate to:** https://supabase.com/dashboard/project/omsxsirtxfrvxiddhmxr
2. **Go to:** SQL Editor
3. **Create new query**
4. **Copy and paste:** The contents of `02_search_knowledge_base_function.sql`
5. **Execute:** Run the query

### Option 2: Local Development

If you have local access to the database:

```bash
psql "your-connection-string" -f database/schemas/modules/rag/02_search_knowledge_base_function.sql
```

## Verification

After deployment, test the function:

```sql
-- Test query (replace with actual values)
SELECT * FROM search_knowledge_base(
  '[0.1, 0.2, ...]'::vector(768),  -- Your embedding vector
  'your-tenant-id',                 -- Tenant UUID
  0.7,                             -- Similarity threshold
  5                                -- Max results
);
```

## Next Steps

1. **Deploy the function** using one of the methods above
2. **Verify** the function exists: `\df search_knowledge_base` in psql
3. **Test** the N8N workflow with a sample complaint
4. **Populate** knowledge base with tenant-specific documents

## Dependencies

Ensure these prerequisites are met:
- ✅ pgvector extension enabled
- ✅ RAG tables created (documento_chunks, documentos_conocimiento)
- ✅ Proper tenant configuration
- ⚠️ **PENDING:** Function deployment (this task)

## Security Notes

- Function uses `SECURITY DEFINER` for controlled access
- Tenant filtering prevents data leakage between concesionarios
- Service role and authenticated users have proper permissions
- All vector searches are automatically filtered by tenant_id

---

**Status:** Ready for deployment ✅  
**Created:** 2025-07-23  
**Priority:** High (required for RAG functionality)