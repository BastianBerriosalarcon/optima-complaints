-- =====================================================
-- OptimaCx - Sistema RAG Knowledge Base
-- Base de conocimiento vectorial para análisis IA
-- =====================================================

-- Asegurar que la extensión vector esté disponible
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla principal de base de conocimiento
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Contenido del documento
    titulo VARCHAR(500) NOT NULL,
    contenido TEXT NOT NULL,
    resumen TEXT, -- Resumen automático generado por IA
    
    -- Categorización del conocimiento
    categoria VARCHAR(100) NOT NULL CHECK (categoria IN (
        'politicas_empresa', 'procedimientos_servicio', 'manuales_tecnicos', 
        'faq_clientes', 'resoluciones_comunes', 'normativas_legales',
        'garantias_productos', 'procesos_reclamos', 'scripts_atencion'
    )),
    subcategoria VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    
    -- Vectorización para RAG
    embedding vector(768), -- Gemini Embedding 001 (768 dimensiones)
    embedding_model VARCHAR(50) DEFAULT 'gemini-embedding-001',
    embedding_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos del documento
    fuente_original TEXT, -- URL, nombre de archivo, etc.
    tipo_documento VARCHAR(50) DEFAULT 'texto', -- 'texto', 'pdf', 'url', 'manual'
    version VARCHAR(20) DEFAULT '1.0',
    idioma VARCHAR(5) DEFAULT 'es',
    
    -- Configuración de uso
    activo BOOLEAN DEFAULT true,
    publico BOOLEAN DEFAULT false, -- Visible para consultas de clientes
    prioridad INTEGER DEFAULT 1, -- Para ordenar resultados de búsqueda
    
    -- Contexto de aplicación
    aplicable_a_canales TEXT[] DEFAULT '{"whatsapp", "email", "web"}', -- Canales donde aplica
    nivel_acceso VARCHAR(20) DEFAULT 'general' CHECK (nivel_acceso IN ('publico', 'general', 'interno', 'confidencial')),
    
    -- Métricas de uso
    veces_usado INTEGER DEFAULT 0,
    ultima_utilizacion TIMESTAMP WITH TIME ZONE,
    efectividad_promedio DECIMAL(3,2), -- Score de efectividad en resolución
    
    -- Auditoría y control
    created_by UUID REFERENCES public.usuarios(id),
    approved_by UUID REFERENCES public.usuarios(id),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de fragmentos de conocimiento (para mejor indexación)
CREATE TABLE IF NOT EXISTS public.knowledge_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knowledge_base_id UUID NOT NULL REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Fragmento del texto
    fragmento TEXT NOT NULL,
    orden_fragmento INTEGER NOT NULL, -- Orden dentro del documento original
    
    -- Vectorización del fragmento
    embedding vector(768), -- Embedding específico del fragmento
    
    -- Metadatos del fragmento
    palabras_clave TEXT[] DEFAULT '{}',
    contexto_previo TEXT, -- Contexto del fragmento anterior
    contexto_posterior TEXT, -- Contexto del fragmento siguiente
    
    -- Configuración
    activo BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(knowledge_base_id, orden_fragmento)
);

-- Tabla de interacciones RAG (para métricas y mejora)
CREATE TABLE IF NOT EXISTS public.rag_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Consulta original
    query_original TEXT NOT NULL,
    query_embedding vector(768),
    
    -- Contexto de la consulta
    contexto_tipo VARCHAR(50) NOT NULL, -- 'reclamo', 'lead', 'encuesta', 'general'
    contexto_id UUID, -- ID del reclamo, lead, etc.
    canal_origen VARCHAR(30), -- 'whatsapp', 'email', 'web'
    
    -- Resultados de búsqueda
    knowledge_docs_found JSONB DEFAULT '[]', -- IDs y scores de documentos encontrados
    knowledge_fragments_used JSONB DEFAULT '[]', -- Fragmentos específicos utilizados
    
    -- Respuesta generada
    respuesta_generada TEXT,
    prompt_utilizado TEXT, -- Prompt enviado a la IA
    modelo_ia_usado VARCHAR(50) DEFAULT 'gemini-2.5-pro',
    
    -- Métricas de calidad
    relevancia_score DECIMAL(3,2), -- Score de relevancia del resultado
    tiempo_procesamiento_ms INTEGER,
    resolvio_consulta BOOLEAN, -- Si la respuesta resolvió la consulta
    
    -- Feedback del usuario
    feedback_positivo BOOLEAN,
    comentario_feedback TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda vectorial optimizada
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
ON public.knowledge_base USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_knowledge_fragments_embedding 
ON public.knowledge_fragments USING ivfflat (embedding vector_cosine_ops);

-- Índices para consultas frecuentes
CREATE INDEX idx_knowledge_base_concesionario ON public.knowledge_base(concesionario_id);
CREATE INDEX idx_knowledge_base_categoria ON public.knowledge_base(categoria);
CREATE INDEX idx_knowledge_base_activo ON public.knowledge_base(activo) WHERE activo = true;
CREATE INDEX idx_knowledge_base_publico ON public.knowledge_base(publico) WHERE publico = true;
CREATE INDEX idx_knowledge_fragments_kb_id ON public.knowledge_fragments(knowledge_base_id);
CREATE INDEX idx_rag_interactions_concesionario ON public.rag_interactions(concesionario_id);
CREATE INDEX idx_rag_interactions_contexto ON public.rag_interactions(contexto_tipo, contexto_id);
CREATE INDEX idx_rag_interactions_fecha ON public.rag_interactions(created_at);

-- RLS Policies para aislamiento multitenant
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_interactions ENABLE ROW LEVEL SECURITY;

-- Policies para knowledge_base
CREATE POLICY "Knowledge base is tenant isolated" 
ON public.knowledge_base
FOR ALL 
USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Policies para knowledge_fragments
CREATE POLICY "Knowledge fragments are tenant isolated" 
ON public.knowledge_fragments
FOR ALL 
USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Policies para rag_interactions
CREATE POLICY "RAG interactions are tenant isolated" 
ON public.rag_interactions
FOR ALL 
USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Triggers para updated_at
CREATE TRIGGER set_knowledge_base_updated_at
    BEFORE UPDATE ON public.knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Función para búsqueda vectorial con filtros de tenant
CREATE OR REPLACE FUNCTION search_knowledge_base(
    p_concesionario_id UUID,
    p_query_embedding vector(768),
    p_categoria VARCHAR(100) DEFAULT NULL,
    p_activo_only BOOLEAN DEFAULT true,
    p_limit INTEGER DEFAULT 5,
    p_threshold DECIMAL DEFAULT 0.7
)
RETURNS TABLE(
    id UUID,
    titulo VARCHAR(500),
    contenido TEXT,
    categoria VARCHAR(100),
    similarity_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kb.id,
        kb.titulo,
        kb.contenido,
        kb.categoria,
        (1 - (kb.embedding <=> p_query_embedding))::DECIMAL as similarity_score
    FROM public.knowledge_base kb
    WHERE kb.concesionario_id = p_concesionario_id
        AND (p_activo_only = false OR kb.activo = true)
        AND (p_categoria IS NULL OR kb.categoria = p_categoria)
        AND (1 - (kb.embedding <=> p_query_embedding)) >= p_threshold
    ORDER BY kb.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para búsqueda en fragmentos
CREATE OR REPLACE FUNCTION search_knowledge_fragments(
    p_concesionario_id UUID,
    p_query_embedding vector(768),
    p_limit INTEGER DEFAULT 10,
    p_threshold DECIMAL DEFAULT 0.7
)
RETURNS TABLE(
    fragment_id UUID,
    knowledge_base_id UUID,
    fragmento TEXT,
    palabras_clave TEXT[],
    similarity_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kf.id,
        kf.knowledge_base_id,
        kf.fragmento,
        kf.palabras_clave,
        (1 - (kf.embedding <=> p_query_embedding))::DECIMAL as similarity_score
    FROM public.knowledge_fragments kf
    WHERE kf.concesionario_id = p_concesionario_id
        AND kf.activo = true
        AND (1 - (kf.embedding <=> p_query_embedding)) >= p_threshold
    ORDER BY kf.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar interacción RAG
CREATE OR REPLACE FUNCTION log_rag_interaction(
    p_concesionario_id UUID,
    p_query_original TEXT,
    p_query_embedding vector(768),
    p_contexto_tipo VARCHAR(50),
    p_contexto_id UUID DEFAULT NULL,
    p_canal_origen VARCHAR(30) DEFAULT NULL,
    p_knowledge_docs JSONB DEFAULT '[]',
    p_respuesta_generada TEXT DEFAULT NULL,
    p_tiempo_procesamiento_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_interaction_id UUID;
BEGIN
    INSERT INTO public.rag_interactions (
        concesionario_id,
        query_original,
        query_embedding,
        contexto_tipo,
        contexto_id,
        canal_origen,
        knowledge_docs_found,
        respuesta_generada,
        tiempo_procesamiento_ms
    )
    VALUES (
        p_concesionario_id,
        p_query_original,
        p_query_embedding,
        p_contexto_tipo,
        p_contexto_id,
        p_canal_origen,
        p_knowledge_docs,
        p_respuesta_generada,
        p_tiempo_procesamiento_ms
    )
    RETURNING id INTO v_interaction_id;
    
    RETURN v_interaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE public.knowledge_base IS 'Base de conocimiento vectorizada para sistema RAG por concesionario';
COMMENT ON TABLE public.knowledge_fragments IS 'Fragmentos de documentos para búsqueda granular con embeddings';
COMMENT ON TABLE public.rag_interactions IS 'Log de interacciones RAG para métricas y mejora del sistema';
COMMENT ON COLUMN public.knowledge_base.embedding IS 'Vector embedding generado con Gemini Embedding 001 (768 dimensiones)';
COMMENT ON FUNCTION search_knowledge_base IS 'Búsqueda vectorial en base de conocimiento con filtros de tenant';
COMMENT ON FUNCTION search_knowledge_fragments IS 'Búsqueda vectorial en fragmentos de documentos';
COMMENT ON FUNCTION log_rag_interaction IS 'Registra interacción RAG para análisis y mejora';
