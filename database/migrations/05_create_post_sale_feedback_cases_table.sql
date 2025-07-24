-- Migration: 05_create_post_sale_feedback_cases_table
-- Description: Creates the table to manage post-sale feedback cases for low survey scores.

CREATE TABLE public.casos_feedback_postventa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.encuestas(id) ON DELETE CASCADE,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    asesor_servicio_id UUID REFERENCES public.usuarios(id),
    jefe_servicio_id UUID REFERENCES public.usuarios(id),
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
CREATE INDEX idx_casos_feedback_postventa_estado ON public.casos_feedback_postventa(estado);
CREATE INDEX idx_casos_feedback_postventa_asesor_id ON public.casos_feedback_postventa(asesor_servicio_id);
CREATE INDEX idx_casos_feedback_postventa_concesionario_id ON public.casos_feedback_postventa(concesionario_id);

-- Trigger to update 'updated_at' timestamp
CREATE TRIGGER set_casos_feedback_postventa_updated_at
BEFORE UPDATE ON public.casos_feedback_postventa
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

COMMENT ON TABLE public.casos_feedback_postventa IS 'Stores and tracks feedback cases from low-score post-sale surveys.';
COMMENT ON COLUMN public.casos_feedback_postventa.estado IS 'The current status of the feedback case (abierto, en_gestion, cerrado, escalado).';
COMMENT ON COLUMN public.casos_feedback_postventa.resolucion IS 'Details on how the case was resolved.';
