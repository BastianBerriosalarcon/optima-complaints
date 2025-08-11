-- Migration: Crear tabla encuestas_ventas para el módulo de ventas
-- Fecha: 2025-08-11
-- Propósito: Habilitar encuestas de satisfacción de ventas con automatización N8N

CREATE TABLE IF NOT EXISTS public.encuestas_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    
    -- Relación con lead y asesor
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    asesor_ventas_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    
    -- Datos del cliente (snapshot al momento de la encuesta)
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_rut VARCHAR(20),
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(255),
    
    -- Datos del vehículo vendido
    vehiculo_modelo VARCHAR(200) NOT NULL,
    vehiculo_vin VARCHAR(17),
    fecha_venta DATE NOT NULL,
    
    -- Preguntas de la encuesta de ventas (1-10)
    experiencia_venta INTEGER CHECK (experiencia_venta >= 1 AND experiencia_venta <= 10),
    satisfaccion_asesor_ventas INTEGER CHECK (satisfaccion_asesor_ventas >= 1 AND satisfaccion_asesor_ventas <= 10),
    claridad_informacion INTEGER CHECK (claridad_informacion >= 1 AND claridad_informacion <= 10),
    recomendacion_venta INTEGER CHECK (recomendacion_venta >= 1 AND recomendacion_venta <= 10),
    
    -- Campo de comentarios
    comentario_venta TEXT,
    
    -- Campos calculados
    average_score DECIMAL(3,2), -- Promedio automático de las 4 preguntas
    
    -- Origen y estado
    origen VARCHAR(20) NOT NULL CHECK (origen IN ('QR_VENTAS', 'WhatsApp_VENTAS', 'Llamada_VENTAS', 'WhatsApp_PERDIDO')),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado')),
    
    -- Asignación para contact center (solo para llamadas)
    contact_center_user_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    
    -- Control de automatización
    requiere_notificacion BOOLEAN DEFAULT false, -- True si score <= 8
    notificacion_enviada BOOLEAN DEFAULT false,
    fecha_notificacion TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(concesionario_id, cliente_telefono, fecha_venta)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_concesionario ON public.encuestas_ventas(concesionario_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_asesor ON public.encuestas_ventas(asesor_ventas_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_origen ON public.encuestas_ventas(origen);
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_estado ON public.encuestas_ventas(estado);
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_lead ON public.encuestas_ventas(lead_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_notificacion ON public.encuestas_ventas(requiere_notificacion) WHERE requiere_notificacion = true;

-- Función para calcular promedio automáticamente
CREATE OR REPLACE FUNCTION calculate_sales_survey_average()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular promedio solo si todas las preguntas están contestadas
    IF NEW.experiencia_venta IS NOT NULL AND 
       NEW.satisfaccion_asesor_ventas IS NOT NULL AND 
       NEW.claridad_informacion IS NOT NULL AND 
       NEW.recomendacion_venta IS NOT NULL THEN
        
        NEW.average_score := (
            NEW.experiencia_venta + 
            NEW.satisfaccion_asesor_ventas + 
            NEW.claridad_informacion + 
            NEW.recomendacion_venta
        )::DECIMAL / 4;
        
        -- Marcar como completado
        NEW.estado := 'completado';
        
        -- Determinar si requiere notificación (score <= 8)
        NEW.requiere_notificacion := (NEW.average_score <= 8.0);
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular promedio automáticamente
DROP TRIGGER IF EXISTS trigger_calculate_sales_survey_average ON public.encuestas_ventas;
CREATE TRIGGER trigger_calculate_sales_survey_average
    BEFORE INSERT OR UPDATE ON public.encuestas_ventas
    FOR EACH ROW
    EXECUTE FUNCTION calculate_sales_survey_average();

-- Habilitar Row Level Security
ALTER TABLE public.encuestas_ventas ENABLE ROW LEVEL SECURITY;

-- Política RLS básica (multitenant por concesionario_id)
DROP POLICY IF EXISTS "Users can access sales surveys from their concesionario" ON public.encuestas_ventas;
CREATE POLICY "Users can access sales surveys from their concesionario" ON public.encuestas_ventas
    FOR ALL USING (
        concesionario_id IN (
            SELECT concesionario_id FROM public.usuarios 
            WHERE auth_id = auth.uid()
        )
    );

-- Comentarios para documentación
COMMENT ON TABLE public.encuestas_ventas IS 'Sales satisfaction surveys with multi-channel automation (QR/WhatsApp/Call)';
COMMENT ON COLUMN public.encuestas_ventas.origen IS 'Source channel: QR_VENTAS, WhatsApp_VENTAS, Llamada_VENTAS, WhatsApp_PERDIDO';
COMMENT ON COLUMN public.encuestas_ventas.average_score IS 'Automatically calculated average of 4 survey questions';
COMMENT ON COLUMN public.encuestas_ventas.requiere_notificacion IS 'True if average_score <= 8, triggers N8N workflow';

-- Grant permisos básicos
GRANT SELECT, INSERT, UPDATE ON public.encuestas_ventas TO authenticated;
GRANT USAGE ON SEQUENCE public.encuestas_ventas_id_seq TO authenticated;
