-- =====================================================
-- FUNCIONES RAG MEJORADAS MULTITENANT
-- Compatible con Gemini Embedding 001 (3072 dimensiones)
-- =====================================================

-- Función principal de búsqueda RAG con contexto
CREATE OR REPLACE FUNCTION buscar_conocimiento_rag_contextual(
    p_tenant_id UUID,
    p_consulta TEXT,
    p_contexto VARCHAR(20), -- 'ventas', 'post_venta', 'compartido'
    p_categoria VARCHAR(100) DEFAULT NULL,
    p_num_resultados INTEGER DEFAULT 5,
    p_threshold DECIMAL DEFAULT 0.7,
    p_query_embedding vector(3072) DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    documento_id UUID,
    contenido TEXT,
    titulo_documento VARCHAR(255),
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    similitud DECIMAL,
    metadata JSONB,
    tags JSONB,
    peso_busqueda DECIMAL,
    chunk_index INTEGER
) AS $$
DECLARE
    config_tenant RECORD;
BEGIN
    -- Obtener configuración específica del tenant
    SELECT * INTO config_tenant 
    FROM public.rag_config_tenant 
    WHERE concesionario_id = p_tenant_id;
    
    -- Si no hay configuración, usar valores por defecto
    IF config_tenant IS NULL THEN
        INSERT INTO public.rag_config_tenant (concesionario_id) 
        VALUES (p_tenant_id);
        
        SELECT * INTO config_tenant 
        FROM public.rag_config_tenant 
        WHERE concesionario_id = p_tenant_id;
    END IF;
    
    -- Búsqueda vectorial con filtros contextuales
    RETURN QUERY
    SELECT 
        dc.id,
        dc.documento_id,
        dc.contenido,
        d.titulo,
        dc.categoria,
        dc.subcategoria,
        ROUND((1 - (dc.embedding <=> p_query_embedding))::DECIMAL, 4) as similitud,
        dc.metadata,
        d.tags,
        dc.peso_busqueda,
        dc.chunk_index
    FROM public.documento_chunks dc
    JOIN public.documentos_conocimiento d ON dc.documento_id = d.id
    WHERE 
        -- Filtro obligatorio por tenant
        dc.concesionario_id = p_tenant_id
        
        -- Filtro por contexto (incluyendo 'compartido')
        AND (dc.contexto = p_contexto OR dc.contexto = 'compartido')
        
        -- Filtro opcional por categoría
        AND (p_categoria IS NULL OR dc.categoria = p_categoria)
        
        -- Solo documentos activos
        AND d.activo = true
        
        -- Filtro por vigencia temporal
        AND (dc.fecha_vigencia_desde IS NULL OR dc.fecha_vigencia_desde <= CURRENT_DATE)
        AND (dc.fecha_vigencia_hasta IS NULL OR dc.fecha_vigencia_hasta >= CURRENT_DATE)
        
        -- Umbral de similitud
        AND (1 - (dc.embedding <=> p_query_embedding)) >= p_threshold::FLOAT
        
    ORDER BY 
        -- Ordenar por similitud ponderada por peso
        (dc.embedding <=> p_query_embedding) * (2.0 - dc.peso_busqueda::FLOAT)
        
    LIMIT p_num_resultados;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para rerank con Cohere (preparación)
CREATE OR REPLACE FUNCTION preparar_chunks_para_rerank(
    p_chunk_ids UUID[],
    p_consulta_original TEXT
)
RETURNS JSONB AS $$
DECLARE
    resultado JSONB;
    chunk_record RECORD;
    chunks_array JSONB;
BEGIN
    chunks_array := '[]'::JSONB;
    
    -- Construir array de documentos para Cohere Rerank
    FOR chunk_record IN
        SELECT 
            dc.id,
            dc.contenido,
            d.titulo,
            dc.categoria,
            dc.chunk_index
        FROM public.documento_chunks dc
        JOIN public.documentos_conocimiento d ON dc.documento_id = d.id
        WHERE dc.id = ANY(p_chunk_ids)
        ORDER BY array_position(p_chunk_ids, dc.id)
    LOOP
        chunks_array := chunks_array || jsonb_build_object(
            'text', chunk_record.contenido,
            'metadata', jsonb_build_object(
                'chunk_id', chunk_record.id,
                'titulo', chunk_record.titulo,
                'categoria', chunk_record.categoria,
                'chunk_index', chunk_record.chunk_index
            )
        );
    END LOOP;
    
    resultado := jsonb_build_object(
        'query', p_consulta_original,
        'documents', chunks_array,
        'max_chunks_to_rank', array_length(p_chunk_ids, 1)
    );
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar consulta RAG (analytics)
CREATE OR REPLACE FUNCTION registrar_consulta_rag(
    p_tenant_id UUID,
    p_consulta TEXT,
    p_contexto VARCHAR(20),
    p_chunks_usados UUID[],
    p_respuesta_ia TEXT,
    p_tiempo_busqueda INTEGER DEFAULT NULL,
    p_tiempo_generacion INTEGER DEFAULT NULL,
    p_tokens_usados INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    chunks_info JSONB;
BEGIN
    -- Construir información de chunks utilizados
    SELECT jsonb_agg(
        jsonb_build_object(
            'chunk_id', dc.id,
            'similarity', COALESCE(dc.relevancia_promedio, 0.0),
            'categoria', dc.categoria,
            'documento_titulo', d.titulo
        )
    ) INTO chunks_info
    FROM public.documento_chunks dc
    JOIN public.documentos_conocimiento d ON dc.documento_id = d.id
    WHERE dc.id = ANY(p_chunks_usados);
    
    -- Insertar log de consulta
    INSERT INTO public.rag_consultas_log (
        concesionario_id,
        consulta_original,
        contexto,
        categoria_detectada,
        chunks_recuperados,
        num_chunks_usados,
        tiempo_busqueda_ms,
        respuesta_ia,
        tiempo_generacion_ms,
        tokens_usados
    ) VALUES (
        p_tenant_id,
        p_consulta,
        p_contexto,
        'automatica', -- Se podría detectar automáticamente
        chunks_info,
        array_length(p_chunks_usados, 1),
        p_tiempo_busqueda,
        p_respuesta_ia,
        p_tiempo_generacion,
        p_tokens_usados
    ) RETURNING id INTO log_id;
    
    -- Actualizar estadísticas de chunks utilizados
    UPDATE public.documento_chunks 
    SET veces_recuperado = veces_recuperado + 1
    WHERE id = ANY(p_chunks_usados);
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener configuración RAG de un tenant
CREATE OR REPLACE FUNCTION obtener_config_rag_tenant(
    p_tenant_id UUID,
    p_contexto VARCHAR(20) DEFAULT 'post_venta'
)
RETURNS JSONB AS $$
DECLARE
    config_record RECORD;
    config_contexto JSONB;
BEGIN
    SELECT * INTO config_record 
    FROM public.rag_config_tenant 
    WHERE concesionario_id = p_tenant_id;
    
    -- Si no existe configuración, crear una por defecto
    IF config_record IS NULL THEN
        INSERT INTO public.rag_config_tenant (concesionario_id) 
        VALUES (p_tenant_id);
        
        SELECT * INTO config_record 
        FROM public.rag_config_tenant 
        WHERE concesionario_id = p_tenant_id;
    END IF;
    
    -- Obtener configuración específica del contexto
    IF p_contexto = 'ventas' THEN
        config_contexto := config_record.config_ventas;
    ELSE
        config_contexto := config_record.config_post_venta;
    END IF;
    
    RETURN jsonb_build_object(
        'tenant_id', p_tenant_id,
        'contexto', p_contexto,
        'modelo_embedding', config_record.modelo_embedding,
        'modelo_llm', config_record.modelo_llm,
        'dimensiones_vector', config_record.dimensiones_vector,
        'temperatura', config_record.temperatura,
        'max_tokens', config_record.max_tokens,
        'config_contexto', config_contexto,
        'prompts_personalizados', CASE 
            WHEN p_contexto = 'ventas' THEN config_record.prompts_ventas
            ELSE config_record.prompts_post_venta
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices adicionales para optimizar búsquedas RAG
CREATE INDEX IF NOT EXISTS idx_documento_chunks_tenant_contexto_categoria 
ON public.documento_chunks (concesionario_id, contexto, categoria) 
WHERE fecha_vigencia_hasta IS NULL OR fecha_vigencia_hasta >= CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_documento_chunks_veces_recuperado 
ON public.documento_chunks (veces_recuperado DESC);

CREATE INDEX IF NOT EXISTS idx_rag_consultas_tenant_fecha 
ON public.rag_consultas_log (concesionario_id, created_at DESC);

-- Permisos para las funciones
GRANT EXECUTE ON FUNCTION buscar_conocimiento_rag_contextual TO service_role;
GRANT EXECUTE ON FUNCTION buscar_conocimiento_rag_contextual TO authenticated;
GRANT EXECUTE ON FUNCTION preparar_chunks_para_rerank TO service_role;
GRANT EXECUTE ON FUNCTION registrar_consulta_rag TO service_role;
GRANT EXECUTE ON FUNCTION obtener_config_rag_tenant TO service_role;
GRANT EXECUTE ON FUNCTION obtener_config_rag_tenant TO authenticated;

-- Comentarios para documentación
COMMENT ON FUNCTION buscar_conocimiento_rag_contextual IS 'Función principal para búsqueda RAG multitenant con contexto (ventas/post-venta)';
COMMENT ON FUNCTION registrar_consulta_rag IS 'Registra consultas RAG para analytics y mejora del sistema';
COMMENT ON FUNCTION obtener_config_rag_tenant IS 'Obtiene configuración RAG específica de un tenant y contexto';