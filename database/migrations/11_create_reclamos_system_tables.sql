-- =====================================================
-- OptimaCx - Sistema de Reclamos Completo
-- Tablas para gestión de reclamos con IA y RAG
-- =====================================================

-- 1. Tabla de categorías de reclamos
CREATE TABLE IF NOT EXISTS public.categorias_reclamo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Información básica
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Color hex para UI
    icono VARCHAR(50), -- Nombre del icono para frontend
    
    -- Configuración de gestión
    es_activa BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 1,
    tiempo_resolucion_estimado INTEGER, -- Horas estimadas de resolución
    requiere_escalamiento BOOLEAN DEFAULT false,
    nivel_prioridad VARCHAR(10) DEFAULT 'media' CHECK (nivel_prioridad IN ('baja', 'media', 'alta', 'critica')),
    
    -- Automatización y asignación
    departamento_responsable VARCHAR(100), -- 'servicio', 'ventas', 'administracion'
    flujo_resolucion JSONB DEFAULT '{}', -- Pasos automatizados de resolución
    plantilla_respuesta TEXT, -- Template de respuesta automática
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id, nombre)
);

-- 2. Tabla principal de reclamos
CREATE TABLE IF NOT EXISTS public.reclamos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    vehiculo_id UUID REFERENCES public.vehiculos(id) ON DELETE SET NULL,
    venta_id UUID REFERENCES public.ventas(id) ON DELETE SET NULL,
    servicio_id UUID REFERENCES public.servicios(id) ON DELETE SET NULL,
    
    -- Identificación del reclamo
    numero_reclamo VARCHAR(50) NOT NULL, -- REC-2024-001
    categoria_id UUID REFERENCES public.categorias_reclamo(id),
    
    -- Datos del cliente (snapshot al momento del reclamo)
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255),
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_rut VARCHAR(20),
    
    -- Contenido del reclamo
    titulo VARCHAR(500) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'asignado', 'en_proceso', 'resuelto', 'cerrado')),
    prioridad VARCHAR(10) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
    urgencia VARCHAR(10) DEFAULT 'normal' CHECK (urgencia IN ('baja', 'normal', 'alta')),
    
    -- Canal de ingreso y contexto
    canal_ingreso VARCHAR(30) NOT NULL CHECK (canal_ingreso IN ('whatsapp', 'email', 'web', 'presencial', 'telefono')),
    
    -- Asignación responsable
    asignado_a_user_id UUID REFERENCES public.usuarios(id),
    
    -- Fechas de seguimiento
    fecha_limite_resolucion TIMESTAMP WITH TIME ZONE,
    fecha_primera_respuesta TIMESTAMP WITH TIME ZONE,
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    tiempo_resolucion_horas INTEGER,
    
    -- Satisfacción del cliente
    satisfaccion_cliente INTEGER CHECK (satisfaccion_cliente >= 1 AND satisfaccion_cliente <= 10),
    comentario_satisfaccion TEXT,
    
    -- Resolución y compensación
    es_fundado BOOLEAN,
    motivo_no_fundado TEXT,
    compensacion_ofrecida TEXT,
    valor_compensacion DECIMAL(10,2),
    
    -- Black Alert (ley del consumidor - fallas dentro de 6 meses)
    es_black_alert BOOLEAN DEFAULT false,
    
    -- Seguimiento público/privado
    requiere_seguimiento BOOLEAN DEFAULT false,
    es_publico BOOLEAN DEFAULT false,
    url_seguimiento TEXT, -- URL pública para seguimiento del cliente
    
    -- Clasificación automática por IA
    clasificacion_ia JSONB DEFAULT '{}', -- Resultado del análisis RAG
    sentimiento_analisis JSONB DEFAULT '{}', -- Análisis de sentimiento del reclamo
    
    -- Metadatos y adjuntos
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}', -- URLs de archivos adjuntos
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint de número único por concesionario
    UNIQUE(concesionario_id, numero_reclamo)
);

-- 3. Tabla de seguimientos/historial de reclamos
CREATE TABLE IF NOT EXISTS public.seguimientos_reclamo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamo_id UUID NOT NULL REFERENCES public.reclamos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.usuarios(id), -- Usuario que realiza el seguimiento
    
    -- Tipo de seguimiento
    tipo_seguimiento VARCHAR(30) NOT NULL CHECK (tipo_seguimiento IN (
        'comentario', 'cambio_estado', 'asignacion', 'resolucion', 
        'comunicacion_cliente', 'escalamiento', 'documentacion'
    )),
    
    -- Contenido del seguimiento
    titulo VARCHAR(255),
    descripcion TEXT NOT NULL,
    
    -- Visibilidad y tipo
    es_publico BOOLEAN DEFAULT false, -- Visible para el cliente en portal
    es_respuesta_automatica BOOLEAN DEFAULT false, -- Generado por IA/workflow
    
    -- Tracking de cambios de estado
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20),
    asignado_anterior VARCHAR(255),
    asignado_nuevo VARCHAR(255),
    
    -- Información de comunicación
    canal_comunicacion VARCHAR(30), -- 'whatsapp', 'email', 'llamada', 'presencial'
    tiempo_dedicado_minutos INTEGER DEFAULT 0,
    
    -- Adjuntos y metadatos específicos
    attachments TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Control de notificaciones
    notificado_cliente BOOLEAN DEFAULT false,
    fecha_notificacion TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_categorias_reclamo_concesionario ON public.categorias_reclamo(concesionario_id);
CREATE INDEX idx_reclamos_concesionario ON public.reclamos(concesionario_id);
CREATE INDEX idx_reclamos_estado ON public.reclamos(estado);
CREATE INDEX idx_reclamos_asignado ON public.reclamos(asignado_a_user_id);
CREATE INDEX idx_reclamos_fecha ON public.reclamos(created_at);
CREATE INDEX idx_reclamos_black_alert ON public.reclamos(es_black_alert) WHERE es_black_alert = true;
CREATE INDEX idx_seguimientos_reclamo_id ON public.seguimientos_reclamo(reclamo_id);
CREATE INDEX idx_seguimientos_publicos ON public.seguimientos_reclamo(es_publico) WHERE es_publico = true;

-- RLS Policies para aislamiento multitenant
ALTER TABLE public.categorias_reclamo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reclamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos_reclamo ENABLE ROW LEVEL SECURITY;

-- Policy para categorías de reclamo
CREATE POLICY "Categorias reclamo are tenant isolated" 
ON public.categorias_reclamo
FOR ALL 
USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Policy para reclamos
CREATE POLICY "Reclamos are tenant isolated" 
ON public.reclamos
FOR ALL 
USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Policy para seguimientos de reclamo
CREATE POLICY "Seguimientos reclamo are tenant isolated" 
ON public.seguimientos_reclamo
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.reclamos 
        WHERE id = seguimientos_reclamo.reclamo_id 
        AND concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID
    )
);

-- Triggers para updated_at
CREATE TRIGGER set_categorias_reclamo_updated_at
    BEFORE UPDATE ON public.categorias_reclamo
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_reclamos_updated_at
    BEFORE UPDATE ON public.reclamos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Función para generar número de reclamo automático
CREATE OR REPLACE FUNCTION generate_numero_reclamo(p_concesionario_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_year TEXT;
    v_sequence INTEGER;
    v_numero TEXT;
BEGIN
    v_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Obtener el siguiente número de secuencia para el año actual
    SELECT COALESCE(MAX(
        CASE 
            WHEN numero_reclamo ~ ('^REC-' || v_year || '-\d+$') 
            THEN SUBSTRING(numero_reclamo FROM '\d+$')::INTEGER 
            ELSE 0 
        END
    ), 0) + 1
    INTO v_sequence
    FROM public.reclamos 
    WHERE concesionario_id = p_concesionario_id;
    
    v_numero := 'REC-' || v_year || '-' || LPAD(v_sequence::TEXT, 3, '0');
    
    RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-generar número de reclamo
CREATE OR REPLACE FUNCTION set_numero_reclamo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_reclamo IS NULL OR NEW.numero_reclamo = '' THEN
        NEW.numero_reclamo := generate_numero_reclamo(NEW.concesionario_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_numero_reclamo
    BEFORE INSERT ON public.reclamos
    FOR EACH ROW
    EXECUTE FUNCTION set_numero_reclamo();

-- Comentarios para documentación
COMMENT ON TABLE public.categorias_reclamo IS 'Categorías configurables de reclamos por concesionario';
COMMENT ON TABLE public.reclamos IS 'Tabla principal de reclamos con análisis IA y seguimiento completo';
COMMENT ON TABLE public.seguimientos_reclamo IS 'Historial completo de modificaciones y seguimientos de reclamos';
COMMENT ON COLUMN public.reclamos.es_black_alert IS 'Indica si es Black Alert (ley del consumidor - falla dentro de 6 meses)';
COMMENT ON COLUMN public.reclamos.clasificacion_ia IS 'Resultado del análisis RAG con IA para clasificación automática';
COMMENT ON COLUMN public.reclamos.numero_reclamo IS 'Número único del reclamo generado automáticamente (REC-YYYY-001)';
