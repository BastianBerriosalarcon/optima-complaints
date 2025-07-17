-- =====================================================
-- RAG Unificado - Esquema para Ventas + Post-Venta
-- Sistema multitenant con contexto inteligente
-- =====================================================

-- Tabla principal de documentos con contexto
CREATE TABLE IF NOT EXISTS public.documentos_conocimiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Metadatos del documento
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_documento VARCHAR(50) NOT NULL, -- 'catalogo', 'manual', 'procedimiento', 'faq', etc.
    
    -- Contexto de aplicación (CLAVE para RAG unificado)
    contexto VARCHAR(20) NOT NULL CHECK (contexto IN ('ventas', 'post_venta', 'compartido')),
    categoria VARCHAR(100) NOT NULL, -- 'productos', 'garantias', 'procedimientos', 'precios'
    subcategoria VARCHAR(100),
    
    -- Tags para filtrado granular
    tags JSONB DEFAULT '[]', -- ['toyota', 'corolla', 'financiamiento', 'promocion']
    
    -- Archivo original
    archivo_url TEXT,
    archivo_nombre VARCHAR(255),
    tipo_archivo VARCHAR(10), -- 'pdf', 'xlsx', 'docx', 'txt'
    tamaño_archivo INTEGER,
    
    -- Contenido procesado
    contenido_texto TEXT,
    resumen_ia TEXT, -- Resumen generado por IA
    
    -- Metadatos de versionado
    version VARCHAR(20) DEFAULT '1.0',
    version_anterior_id UUID REFERENCES public.documentos_conocimiento(id),
    
    -- Estado y configuración
    activo BOOLEAN DEFAULT true,
    publico BOOLEAN DEFAULT false, -- Si puede ser compartido entre tenants
    prioridad INTEGER DEFAULT 1, -- Para ranking en búsquedas
    
    -- Configuración RAG específica
    rag_config JSONB DEFAULT '{}', -- Configuraciones especiales de embedding
    
    -- Metadatos de uso
    total_consultas INTEGER DEFAULT 0,
    ultima_consulta TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.usuarios(id),
    
    -- Índices compuestos para performance
    UNIQUE(concesionario_id, titulo, version)
);

-- Tabla de chunks con embeddings contextualizados
CREATE TABLE IF NOT EXISTS public.documento_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    documento_id UUID REFERENCES public.documentos_conocimiento(id) ON DELETE CASCADE,
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Información del chunk
    chunk_index INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    titulo_chunk VARCHAR(255), -- Título específico del chunk si aplica
    
    -- Contexto heredado del documento + específico
    contexto VARCHAR(20) NOT NULL, -- heredado: 'ventas', 'post_venta', 'compartido'
    categoria VARCHAR(100) NOT NULL, -- heredado del documento
    subcategoria VARCHAR(100),
    
    -- Vector embedding (dimensiones según modelo)
    embedding vector(3072), -- gemini-embedding-001 (3072 dim)
    
    -- Metadatos específicos del chunk
    metadata JSONB DEFAULT '{}', -- Info específica: precios, fechas, modelos aplicables
    
    -- Filtros de aplicabilidad
    modelos_aplicables JSONB DEFAULT '[]', -- ['corolla', 'rav4'] para chunks de productos
    fecha_vigencia_desde DATE,
    fecha_vigencia_hasta DATE,
    
    -- Configuración RAG
    peso_busqueda DECIMAL(3,2) DEFAULT 1.0, -- Peso en búsquedas (0.1-2.0)
    keywords_adicionales JSONB DEFAULT '[]', -- Keywords extra para matching
    
    -- Estadísticas de uso
    veces_recuperado INTEGER DEFAULT 0,
    relevancia_promedio DECIMAL(3,2), -- Feedback de relevancia
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices optimizados para RAG multitenant + contexto
CREATE INDEX IF NOT EXISTS documento_chunks_embedding_idx 
ON public.documento_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Índice compuesto para filtrado rápido por tenant + contexto
CREATE INDEX IF NOT EXISTS documento_chunks_tenant_contexto_idx 
ON public.documento_chunks (concesionario_id, contexto, categoria);

-- Índice para filtrado por vigencia
CREATE INDEX IF NOT EXISTS documento_chunks_vigencia_idx 
ON public.documento_chunks (fecha_vigencia_desde, fecha_vigencia_hasta)
WHERE fecha_vigencia_desde IS NOT NULL;

-- Tabla de configuración RAG por tenant
CREATE TABLE IF NOT EXISTS public.rag_config_tenant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Configuración de embeddings
    modelo_embedding VARCHAR(100) DEFAULT 'gemini-embedding-001',
    dimensiones_vector INTEGER DEFAULT 3072,
    
    -- Configuración de búsqueda
    num_resultados_default INTEGER DEFAULT 5,
    threshold_similitud DECIMAL(3,2) DEFAULT 0.7,
    
    -- Configuración por contexto
    config_ventas JSONB DEFAULT '{
        "num_resultados": 5,
        "threshold": 0.7,
        "categorias_priorizadas": ["productos", "precios", "promociones"],
        "incluir_compartido": true
    }',
    
    config_post_venta JSONB DEFAULT '{
        "num_resultados": 5,
        "threshold": 0.8,
        "categorias_priorizadas": ["garantias", "procedimientos", "faq"],
        "incluir_compartido": true
    }',
    
    -- Prompts personalizados por contexto
    prompts_ventas JSONB DEFAULT '{}',
    prompts_post_venta JSONB DEFAULT '{}',
    
    -- Configuración de modelo LLM
    modelo_llm VARCHAR(100) DEFAULT 'gemini-2.5-pro',
    temperatura DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id)
);

-- Tabla de logs de consultas RAG (para analytics y mejora)
CREATE TABLE IF NOT EXISTS public.rag_consultas_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id),
    
    -- Información de la consulta
    consulta_original TEXT NOT NULL,
    contexto VARCHAR(20) NOT NULL, -- 'ventas' o 'post_venta'
    categoria_detectada VARCHAR(100),
    
    -- Resultados de búsqueda vectorial
    chunks_recuperados JSONB, -- IDs y scores de chunks encontrados
    num_chunks_usados INTEGER,
    tiempo_busqueda_ms INTEGER,
    
    -- Respuesta generada
    respuesta_ia TEXT,
    tiempo_generacion_ms INTEGER,
    tokens_usados INTEGER,
    
    -- Feedback y métricas
    relevancia_usuario INTEGER CHECK (relevancia_usuario >= 1 AND relevancia_usuario <= 5),
    feedback_texto TEXT,
    
    -- Metadatos técnicos
    modelo_usado VARCHAR(100),
    version_prompt VARCHAR(50),
    user_agent TEXT,
    ip_origen INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNCIONES PARA RAG UNIFICADO
-- =====================================================

-- Función para búsqueda RAG contextualizada
CREATE OR REPLACE FUNCTION buscar_conocimiento_rag(
    p_tenant_id UUID,
    p_consulta TEXT,
    p_contexto VARCHAR(20),
    p_num_resultados INTEGER DEFAULT 5,
    p_threshold DECIMAL DEFAULT 0.7
)
RETURNS TABLE (
    chunk_id UUID,
    contenido TEXT,
    titulo_documento VARCHAR(255),
    categoria VARCHAR(100),
    similitud DECIMAL,
    metadata JSONB
) AS $$
BEGIN
    -- Esta función sería implementada con pgvector
    -- Búsqueda por similitud + filtros de contexto
    RETURN QUERY
    SELECT 
        dc.id,
        dc.contenido,
        d.titulo,
        dc.categoria,
        (dc.embedding <=> embedding($1)) as similitud,
        dc.metadata
    FROM public.documento_chunks dc
    JOIN public.documentos_conocimiento d ON dc.documento_id = d.id
    WHERE 
        dc.concesionario_id = p_tenant_id
        AND (dc.contexto = p_contexto OR dc.contexto = 'compartido')
        AND d.activo = true
        AND (dc.fecha_vigencia_desde IS NULL OR dc.fecha_vigencia_desde <= CURRENT_DATE)
        AND (dc.fecha_vigencia_hasta IS NULL OR dc.fecha_vigencia_hasta >= CURRENT_DATE)
        AND (dc.embedding <=> embedding($1)) < (1 - p_threshold)
    ORDER BY dc.embedding <=> embedding($1)
    LIMIT p_num_resultados;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar estadísticas de uso
CREATE OR REPLACE FUNCTION actualizar_stats_chunk(p_chunk_id UUID, p_relevancia DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE public.documento_chunks 
    SET 
        veces_recuperado = veces_recuperado + 1,
        relevancia_promedio = COALESCE(
            (relevancia_promedio * (veces_recuperado - 1) + p_relevancia) / veces_recuperado,
            p_relevancia
        )
    WHERE id = p_chunk_id;
    
    UPDATE public.documentos_conocimiento 
    SET 
        total_consultas = total_consultas + 1,
        ultima_consulta = NOW()
    WHERE id = (SELECT documento_id FROM public.documento_chunks WHERE id = p_chunk_id);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA MANTENIMIENTO AUTOMÁTICO
-- =====================================================

-- Trigger para actualizar updated_at
CREATE TRIGGER update_documentos_conocimiento_updated_at 
    BEFORE UPDATE ON public.documentos_conocimiento 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rag_config_tenant_updated_at 
    BEFORE UPDATE ON public.rag_config_tenant 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS DE EJEMPLO PARA RAG UNIFICADO
-- =====================================================

-- Insertar configuración RAG por defecto para tenants existentes
INSERT INTO public.rag_config_tenant (concesionario_id, modelo_embedding, config_ventas, config_post_venta)
SELECT 
    id,
    'gemini-embedding-001',
    '{
        "num_resultados": 5,
        "threshold": 0.7,
        "categorias_priorizadas": ["productos", "precios", "promociones", "financiamiento"],
        "incluir_compartido": true,
        "boost_productos_nuevos": 1.2
    }',
    '{
        "num_resultados": 5,
        "threshold": 0.8,
        "categorias_priorizadas": ["garantias", "procedimientos", "faq", "soluciones"],
        "incluir_compartido": true,
        "priorizar_casos_similares": true
    }'
FROM public.concesionarios 
WHERE NOT EXISTS (
    SELECT 1 FROM public.rag_config_tenant rtc 
    WHERE rtc.concesionario_id = concesionarios.id
);