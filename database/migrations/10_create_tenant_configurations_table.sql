-- =====================================================
-- OptimaCx - Configuración Multitenant
-- Tabla crítica para el funcionamiento de workflows N8N
-- =====================================================

-- Tabla principal de configuración por concesionario
CREATE TABLE IF NOT EXISTS public.tenant_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Configuración Email/SMTP para notificaciones
    email_config JSONB NOT NULL DEFAULT '{
        "smtp_host": "",
        "smtp_port": 587,
        "smtp_user": "",
        "smtp_password": "",
        "from_email": "",
        "from_name": ""
    }',
    
    -- Configuración IA/Gemini
    ai_config JSONB NOT NULL DEFAULT '{
        "provider": "google",
        "api_key": "",
        "model": "gemini-2.5-pro",
        "embedding_model": "gemini-embedding-001",
        "custom_prompts": {}
    }',
    
    -- Configuración RAG (Retrieval Augmented Generation)
    rag_config JSONB NOT NULL DEFAULT '{
        "vector_index_id": "",
        "search_config": {
            "k": 5,
            "threshold": 0.7
        },
        "knowledge_base_version": "1.0"
    }',
    
    -- Variables específicas para workflows de N8N
    workflow_variables JSONB NOT NULL DEFAULT '{
        "brand_colors": {
            "primary": "#007bff",
            "secondary": "#6c757d"
        },
        "business_hours": {
            "start": "09:00",
            "end": "18:00",
            "timezone": "America/Santiago"
        },
        "notification_templates": {},
        "auto_assignment_rules": {}
    }',
    
    -- URLs y endpoints específicos
    n8n_webhook_base_url TEXT,
    frontend_base_url TEXT,
    
    -- Estado de configuración
    activo BOOLEAN DEFAULT true,
    configuracion_completa BOOLEAN DEFAULT false,
    
    -- Auditoría
    created_by UUID REFERENCES public.usuarios(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(concesionario_id)
);

-- Índices para performance
CREATE INDEX idx_tenant_configurations_concesionario ON public.tenant_configurations(concesionario_id);

-- RLS Policy para tenant isolation
ALTER TABLE public.tenant_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant configurations are isolated by concesionario" 
ON public.tenant_configurations
FOR ALL 
USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tenant_configurations_updated_at
    BEFORE UPDATE ON public.tenant_configurations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Comentarios para documentación
COMMENT ON TABLE public.tenant_configurations IS 'Configuración específica por concesionario para workflows de N8N y integraciones';
COMMENT ON COLUMN public.tenant_configurations.workflow_variables IS 'Variables personalizadas para workflows de N8N';
