# Database Structure Analysis for N8N Workflows

## Executive Summary

Based on analysis of the database schema files, here's a comprehensive assessment of what exists vs. what's missing for the N8N workflows:

## 1. EXISTING Tables and Structure

### ✅ Core Tables (EXIST)
- **concesionarios** - Tenant isolation table
- **sucursales** - Branch/location management
- **usuarios** - User management with roles
- **leads** - Sales leads management
- **productos** - Product/vehicle catalog
- **cotizaciones** - Quotation management
- **ventas** - Sales records
- **encuestas** - Survey system
- **reclamos** - Complaints management

### ✅ RAG Knowledge Base Tables (EXIST)
- **documentos_conocimiento** - Knowledge documents
- **documento_chunks** - Document chunks with embeddings
- **rag_config_tenant** - RAG configuration per tenant
- **rag_consultas_log** - RAG query logging

### ✅ N8N Integration Tables (EXIST)
- **tenant_config** - N8N configuration per tenant
- **advisor_workload_log** - Advisor workload tracking

## 2. FIELD ANALYSIS BY WORKFLOW REQUIREMENTS

### ✅ EXISTING Required Fields

#### usuarios table:
- ✅ **carga_actual** - EXISTS (implied from workload functions)
- ✅ **especialidad** - MISSING but can be added
- ✅ **role** - EXISTS with proper enum values
- ✅ **concesionario_id** - EXISTS for tenant isolation

#### encuestas table:
- ✅ **recomendacion, satisfaccion, lavado, asesor** - EXISTS (1-10 scale)
- ✅ **comentario** - EXISTS
- ❌ **average_score** - MISSING (calculated field needed)
- ❌ **origen** - MISSING (field exists as 'canal' but workflows expect 'origen')

#### leads table:
- ✅ **score_calidad** - EXISTS
- ✅ **asesor_asignado_id** - EXISTS
- ✅ **estado** - EXISTS with proper enum
- ✅ **concesionario_id** - EXISTS

### ❌ MISSING Required Fields

#### documentos_conocimiento table:
- ❌ **autor** - MISSING (has created_by UUID reference instead)
- ❌ **idioma** - MISSING 
- ❌ **estado** - MISSING (has 'activo' boolean instead)
- ❌ **metadatos** - MISSING (some fields exist as separate columns)
- ❌ **chunks_generados** - MISSING (count field)
- ❌ **fecha_procesado** - MISSING (has created_at/updated_at)

#### documento_chunks table:
- ❌ **token_count** - MISSING
- ❌ **metadata** - EXISTS as 'metadata' ✅

## 3. FUNCTIONS AND PROCEDURES

### ✅ EXISTING Functions
- ✅ **search_knowledge_base** - EXISTS but with different signature
- ✅ **incrementar_carga_asesor** - EXISTS
- ✅ **decrementar_carga_asesor** - EXISTS
- ✅ **buscar_conocimiento_rag** - EXISTS (comprehensive RAG function)

### ❌ SIGNATURE MISMATCHES
- **search_knowledge_base** - EXISTS but expects vector(768), schemas show vector(3072)
- **embedding dimensions** - Inconsistency between 768, 1536, and 3072

## 4. CRITICAL ISSUES FOUND

### 🚨 Embedding Dimension Inconsistency
- Search function expects: `vector(768)`
- Schema files show: `vector(3072)` (gemini-embedding-001)
- Migration file shows transition: `1536` → `3072`

### 🚨 Field Name Mismatches
- Workflows expect: `encuestas.origen`
- Database has: `encuestas.canal`
- Workflows expect: `encuestas.average_score`
- Database has: Individual score fields but no calculated average

### 🚨 Missing Computed Fields
- **average_score** in encuestas (needs trigger or view)
- **chunks_generados** in documentos_conocimiento
- **token_count** in documento_chunks

## 5. RECOMMENDATIONS FOR FIX

### High Priority (Required for workflows to work)

1. **Add missing fields to encuestas:**
```sql
ALTER TABLE public.encuestas ADD COLUMN origen VARCHAR(20);
ALTER TABLE public.encuestas ADD COLUMN average_score DECIMAL(3,1);
```

2. **Add missing fields to usuarios:**
```sql
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS especialidad VARCHAR(100);
```

3. **Add missing fields to documentos_conocimiento:**
```sql
ALTER TABLE public.documentos_conocimiento ADD COLUMN autor VARCHAR(255);
ALTER TABLE public.documentos_conocimiento ADD COLUMN idioma VARCHAR(10) DEFAULT 'es';
ALTER TABLE public.documentos_conocimiento ADD COLUMN estado VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.documentos_conocimiento ADD COLUMN metadatos JSONB DEFAULT '{}';
ALTER TABLE public.documentos_conocimiento ADD COLUMN chunks_generados INTEGER DEFAULT 0;
ALTER TABLE public.documentos_conocimiento ADD COLUMN fecha_procesado TIMESTAMP WITH TIME ZONE;
```

4. **Add missing field to documento_chunks:**
```sql
ALTER TABLE public.documento_chunks ADD COLUMN token_count INTEGER;
```

5. **Fix embedding dimensions:**
```sql
-- Update search function to use correct dimensions
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(3072), -- Changed from 768 to 3072
  tenant_filter text,
  similarity_threshold float DEFAULT 0.7,
  max_results int DEFAULT 10
)
-- ... rest of function
```

6. **Create average_score trigger:**
```sql
CREATE OR REPLACE FUNCTION calculate_survey_average()
RETURNS TRIGGER AS $$
BEGIN
  NEW.average_score = (COALESCE(NEW.recomendacion, 0) + COALESCE(NEW.satisfaccion, 0) + 
                      COALESCE(NEW.lavado, 0) + COALESCE(NEW.asesor, 0)) / 4.0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_survey_average
  BEFORE INSERT OR UPDATE ON public.encuestas
  FOR EACH ROW EXECUTE FUNCTION calculate_survey_average();
```

### Medium Priority (Recommended improvements)

1. **Data migration for existing records:**
```sql
-- Copy canal to origen
UPDATE public.encuestas SET origen = canal WHERE origen IS NULL;

-- Calculate average for existing surveys
UPDATE public.encuestas 
SET average_score = (COALESCE(recomendacion, 0) + COALESCE(satisfaccion, 0) + 
                    COALESCE(lavado, 0) + COALESCE(asesor, 0)) / 4.0
WHERE average_score IS NULL;
```

2. **Add validation constraints:**
```sql
ALTER TABLE public.encuestas ADD CONSTRAINT check_origen 
  CHECK (origen IN ('QR', 'WhatsApp', 'Llamada', 'manual'));
```

## 6. WORKFLOW COMPATIBILITY STATUS

| Workflow | Status | Missing Requirements |
|----------|--------|---------------------|
| **complaint-rag-processor** | ⚠️ PARTIAL | Embedding dimension mismatch |
| **knowledge-ingestion** | ❌ BROKEN | Missing fields in documentos_conocimiento |
| **knowledge-chunking** | ❌ BROKEN | Missing token_count field |
| **survey-response-handler** | ⚠️ PARTIAL | Missing average_score, origen field |
| **lead-assignment** | ✅ READY | All required fields exist |
| **survey-low-score-notifier** | ⚠️ PARTIAL | Missing average_score calculation |

## 7. NEXT STEPS

1. **Execute the high-priority SQL migrations** above
2. **Update N8N workflows** to use correct field names where mismatches exist
3. **Test embedding functionality** with correct vector dimensions
4. **Migrate existing data** using medium-priority scripts
5. **Update RAG function signatures** to match current schema

## 8. SECURITY AND RLS STATUS

✅ **Row Level Security (RLS)** is properly implemented across all tables with tenant isolation using `concesionario_id`.

✅ **Proper indexes** exist for performance on multi-tenant queries.

✅ **Audit logging** is implemented for advisor workload changes.

This analysis shows the database is well-architected but needs specific field additions and corrections to fully support the N8N workflows as designed.