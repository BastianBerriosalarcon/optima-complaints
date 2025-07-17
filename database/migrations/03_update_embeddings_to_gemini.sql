-- =====================================================
-- Migración: Actualización de embeddings a Gemini-001
-- Fecha: 2025-01-17
-- Descripción: Actualiza configuración de embeddings desde text-embedding-004 a gemini-embedding-001
-- =====================================================

-- Nota: Esta migración solo actualiza configuraciones.
-- Los embeddings existentes deberán ser regenerados por el sistema RAG.

-- 1. Actualizar configuración de tenant RAG
UPDATE public.rag_config_tenant 
SET 
    modelo_embedding = 'gemini-embedding-001',
    dimensiones_vector = 3072,
    updated_at = NOW()
WHERE modelo_embedding = 'text-embedding-004';

-- 2. Actualizar configuración de tenant_config (si existe)
UPDATE public.tenant_config 
SET 
    ai_model = 'gemini-2.5-pro',
    updated_at = NOW()
WHERE ai_model LIKE '%gemini-2.5%' OR ai_model LIKE '%gemini-1.5%';

-- 3. Crear tabla temporal para migración de embeddings (si es necesario)
CREATE TABLE IF NOT EXISTS public.embedding_migration_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    documento_id UUID,
    chunk_id UUID,
    modelo_anterior VARCHAR(100),
    modelo_nuevo VARCHAR(100),
    dimensiones_anterior INTEGER,
    dimensiones_nuevas INTEGER,
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'procesando', 'completado', 'error'
    fecha_migracion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_mensaje TEXT
);

-- 4. Insertar registros de chunks que necesitan migración
INSERT INTO public.embedding_migration_log (documento_id, chunk_id, modelo_anterior, modelo_nuevo, dimensiones_anterior, dimensiones_nuevas)
SELECT 
    dc.documento_id,
    dc.id,
    'text-embedding-004',
    'gemini-embedding-001',
    1536,
    3072
FROM public.documento_chunks dc
WHERE dc.embedding IS NOT NULL;

-- 5. Agregar columna temporal para nuevos embeddings (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documento_chunks' 
                   AND column_name = 'embedding_new') THEN
        ALTER TABLE public.documento_chunks 
        ADD COLUMN embedding_new vector(3072);
    END IF;
END $$;

-- 6. Crear función para migrar embeddings gradualmente
CREATE OR REPLACE FUNCTION migrar_embeddings_por_lotes(lotes_por_vez INTEGER DEFAULT 100)
RETURNS INTEGER AS $$
DECLARE
    procesados INTEGER := 0;
    chunk_record RECORD;
BEGIN
    -- Procesar chunks en lotes
    FOR chunk_record IN 
        SELECT eml.chunk_id, eml.id as log_id
        FROM public.embedding_migration_log eml
        WHERE eml.estado = 'pendiente'
        ORDER BY eml.fecha_migracion
        LIMIT lotes_por_vez
    LOOP
        -- Marcar como procesando
        UPDATE public.embedding_migration_log 
        SET estado = 'procesando' 
        WHERE id = chunk_record.log_id;
        
        -- Aquí el sistema RAG externo procesará el chunk
        -- Por ahora solo marcamos como pendiente de procesamiento externo
        
        procesados := procesados + 1;
    END LOOP;
    
    RETURN procesados;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear vista para monitorear progreso de migración
CREATE OR REPLACE VIEW public.embedding_migration_progress AS
SELECT 
    estado,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.embedding_migration_log), 2) as porcentaje
FROM public.embedding_migration_log
GROUP BY estado
ORDER BY estado;

-- 8. Comentario sobre próximos pasos
COMMENT ON TABLE public.embedding_migration_log IS 
'Tabla para rastrear la migración de embeddings de text-embedding-004 a gemini-embedding-001. 
Los embeddings reales deben ser regenerados por el sistema RAG usando la nueva API.';

-- 9. Crear índice para consultas de migración
CREATE INDEX IF NOT EXISTS idx_embedding_migration_estado 
ON public.embedding_migration_log(estado);

-- 10. Mostrar resumen de migración
SELECT 
    'Configuración RAG actualizada' as paso,
    COUNT(*) as registros_afectados
FROM public.rag_config_tenant 
WHERE modelo_embedding = 'gemini-embedding-001'
UNION ALL
SELECT 
    'Chunks para migrar' as paso,
    COUNT(*) as registros_afectados
FROM public.embedding_migration_log
WHERE estado = 'pendiente';