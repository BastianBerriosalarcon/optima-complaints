-- Migration: Tablas críticas para conectividad N8N-Supabase
-- Fecha: 2025-08-11
-- Propósito: Habilitar funcionamiento completo de workflows

-- =====================================================
-- 1. CONFIGURACIONES POR CONCESIONARIO (CRÍTICO)
-- =====================================================
CREATE TABLE IF NOT EXISTS configuraciones_concesionario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id) UNIQUE NOT NULL,
    
    -- URLs y endpoints
    webhook_n8n_base TEXT DEFAULT 'https://n8n-optimacx-supabase-dev-1039900134024.southamerica-west1.run.app/webhook/',
    
    -- Configuración general por concesionario
    configuracion JSONB NOT NULL DEFAULT '{
        "whatsapp": {
            "numero": "",
            "api_key": "",
            "webhook_verify_token": ""
        },
        "email": {
            "smtp_host": "",
            "smtp_port": 587,
            "from_email": "",
            "from_name": ""
        },
        "encuestas": {
            "envio_automatico": true,
            "dias_espera_whatsapp": 1,
            "horas_espera_llamada": 6
        },
        "branding": {
            "logo_url": "",
            "color_primario": "#007bff",
            "color_secundario": "#6c757d"
        },
        "horarios": {
            "inicio": "09:00",
            "fin": "18:00",
            "zona_horaria": "America/Santiago"
        }
    }',
    
    -- Estado y timestamps
    es_activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_configuraciones_concesionario_id ON configuraciones_concesionario(concesionario_id);

-- =====================================================
-- 2. INTEGRACIONES EXTERNAS (CRÍTICO)
-- =====================================================
CREATE TABLE IF NOT EXISTS integraciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id) NOT NULL,
    
    -- Tipo y configuración
    tipo_integracion TEXT NOT NULL CHECK (tipo_integracion IN ('whatsapp', 'n8n', 'chatwoot', 'email', 'gemini')),
    nombre TEXT NOT NULL,
    
    -- Configuración específica por integración
    configuracion JSONB NOT NULL DEFAULT '{}',
    
    -- Estado y monitoreo
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'error', 'configurando')),
    ultimo_sync TIMESTAMPTZ,
    ultimo_error TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint único por tipo e integración
    UNIQUE(concesionario_id, tipo_integracion, nombre)
);

-- Índices para performance
CREATE INDEX idx_integraciones_concesionario ON integraciones(concesionario_id);
CREATE INDEX idx_integraciones_tipo ON integraciones(tipo_integracion);
CREATE INDEX idx_integraciones_estado ON integraciones(estado);

-- =====================================================
-- 3. SISTEMA DE NOTIFICACIONES (CRÍTICO)
-- =====================================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id) NOT NULL,
    
    -- Destinatarios
    usuario_id UUID REFERENCES users(user_id),
    cliente_id UUID REFERENCES clientes(id),
    
    -- Contenido de la notificación
    tipo_notificacion TEXT NOT NULL CHECK (tipo_notificacion IN ('email', 'whatsapp', 'sms', 'push', 'internal')),
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    
    -- Estado y envío
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviando', 'enviado', 'entregado', 'fallido', 'cancelado')),
    canal_envio TEXT CHECK (canal_envio IN ('n8n', 'chatwoot', 'manual', 'system')),
    
    -- Referencia al objeto relacionado
    referencia_id UUID,
    referencia_tipo TEXT CHECK (referencia_tipo IN ('lead', 'venta', 'reclamo', 'encuesta', 'cita', 'servicio', 'cotizacion')),
    
    -- Metadata y tracking
    metadata JSONB DEFAULT '{}',
    error_mensaje TEXT,
    intentos_envio INTEGER DEFAULT 0,
    
    -- Timestamps de seguimiento
    programado_para TIMESTAMPTZ,
    enviado_en TIMESTAMPTZ,
    entregado_en TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance y consultas frecuentes
CREATE INDEX idx_notificaciones_concesionario ON notificaciones(concesionario_id);
CREATE INDEX idx_notificaciones_estado ON notificaciones(estado);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo_notificacion);
CREATE INDEX idx_notificaciones_referencia ON notificaciones(referencia_tipo, referencia_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_cliente ON notificaciones(cliente_id);
CREATE INDEX idx_notificaciones_programado ON notificaciones(programado_para) WHERE programado_para IS NOT NULL;

-- =====================================================
-- 4. TEMPLATES DE COMUNICACIÓN (CRÍTICO)
-- =====================================================
CREATE TABLE IF NOT EXISTS templates_comunicacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id) NOT NULL,
    
    -- Identificación del template
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('email', 'whatsapp', 'sms')),
    categoria TEXT NOT NULL CHECK (categoria IN ('bienvenida', 'seguimiento', 'encuesta', 'reclamo', 'cita', 'venta', 'promocion', 'recordatorio')),
    
    -- Contenido del template
    asunto TEXT, -- Para emails
    contenido TEXT NOT NULL,
    
    -- Variables disponibles (documentación)
    variables JSONB DEFAULT '{}',
    -- Ejemplo: {"variables": ["{nombre}", "{vehiculo}", "{fecha}", "{concesionario}"]}
    
    -- Configuración y estado
    es_activo BOOLEAN DEFAULT true,
    es_predeterminado BOOLEAN DEFAULT false, -- Template por defecto para la categoría
    
    -- Metadata
    descripcion TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint único por categoría predeterminada
    UNIQUE(concesionario_id, categoria, tipo, es_predeterminado) DEFERRABLE INITIALLY DEFERRED
);

-- Índices para performance
CREATE INDEX idx_templates_concesionario ON templates_comunicacion(concesionario_id);
CREATE INDEX idx_templates_categoria ON templates_comunicacion(categoria);
CREATE INDEX idx_templates_tipo ON templates_comunicacion(tipo);
CREATE INDEX idx_templates_activo ON templates_comunicacion(es_activo);
CREATE INDEX idx_templates_predeterminado ON templates_comunicacion(es_predeterminado) WHERE es_predeterminado = true;

-- =====================================================
-- 5. AGREGAR VIN A ENCUESTAS (CRÍTICO)
-- =====================================================
-- Agregar campo VIN a respuestas de encuestas
ALTER TABLE respuestas_encuesta 
ADD COLUMN IF NOT EXISTS vin TEXT;

-- Crear índice para búsquedas por VIN
CREATE INDEX IF NOT EXISTS idx_respuestas_encuesta_vin ON respuestas_encuesta(vin);

-- =====================================================
-- 6. TRIGGERS PARA UPDATED_AT AUTOMÁTICO
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Triggers para todas las tablas nuevas
CREATE TRIGGER update_configuraciones_concesionario_updated_at 
    BEFORE UPDATE ON configuraciones_concesionario 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integraciones_updated_at 
    BEFORE UPDATE ON integraciones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notificaciones_updated_at 
    BEFORE UPDATE ON notificaciones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_comunicacion_updated_at 
    BEFORE UPDATE ON templates_comunicacion 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. COMENTARIOS EN TABLAS
-- =====================================================
COMMENT ON TABLE configuraciones_concesionario IS 'Configuraciones específicas por concesionario para webhooks, integraciones y personalización';
COMMENT ON TABLE integraciones IS 'Gestión de integraciones externas (WhatsApp, Email, N8N) por concesionario';
COMMENT ON TABLE notificaciones IS 'Sistema centralizado de notificaciones con tracking de estado y entrega';
COMMENT ON TABLE templates_comunicacion IS 'Templates de mensajes personalizados por concesionario y categoría';

COMMENT ON COLUMN respuestas_encuesta.vin IS 'VIN del vehículo asociado a la encuesta para mejor trazabilidad';
