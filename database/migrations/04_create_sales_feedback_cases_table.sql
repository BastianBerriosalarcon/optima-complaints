-- Migration: 04_create_sales_feedback_cases_table
-- Description: Creates the table to manage sales feedback cases for low survey scores.

CREATE TABLE public.casos_feedback_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.sales_surveys(id) ON DELETE CASCADE,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    asesor_ventas_id UUID NOT NULL REFERENCES public.usuarios(id),
    jefe_ventas_id UUID REFERENCES public.usuarios(id),
    encargado_calidad_id UUID REFERENCES public.usuarios(id),
    
    estado TEXT NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_gestion', 'cerrado', 'escalado')),
    
    fecha_apertura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_cierre TIMESTAMPTZ,
    
    resolucion TEXT,
    
    metadata JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_casos_feedback_ventas_estado ON public.casos_feedback_ventas(estado);
CREATE INDEX idx_casos_feedback_ventas_asesor_id ON public.casos_feedback_ventas(asesor_ventas_id);
CREATE INDEX idx_casos_feedback_ventas_concesionario_id ON public.casos_feedback_ventas(concesionario_id);

-- Trigger to update 'updated_at' timestamp
CREATE TRIGGER set_casos_feedback_ventas_updated_at
BEFORE UPDATE ON public.casos_feedback_ventas
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

COMMENT ON TABLE public.casos_feedback_ventas IS 'Stores and tracks feedback cases from low-score sales surveys.';
COMMENT ON COLUMN public.casos_feedback_ventas.estado IS 'The current status of the feedback case (abierto, en_gestion, cerrado, escalado).';
COMMENT ON COLUMN public.casos_feedback_ventas.resolucion IS 'Details on how the case was resolved.';
