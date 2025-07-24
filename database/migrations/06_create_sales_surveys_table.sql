-- Migration: 06_create_sales_surveys_table
-- Description: Creates sales surveys system similar to post-sale surveys but for vehicle sales
-- Follows same structure as 'encuestas' table but with sales-specific questions

-- Table: encuestas_ventas (sales surveys)
-- Similar structure to 'encuestas' but for post-purchase satisfaction
CREATE TABLE IF NOT EXISTS public.encuestas_ventas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    sucursal_id UUID REFERENCES public.sucursales(id),
    
    -- Customer data (same as post-sale surveys)
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_rut VARCHAR(12),
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(255),
    
    -- Sales-specific data
    asesor_ventas_id UUID NOT NULL REFERENCES public.usuarios(id), -- Sales advisor who handled the sale
    vehiculo_modelo VARCHAR(200) NOT NULL, -- Vehicle model sold
    vehiculo_vin VARCHAR(17), -- VIN number if available
    fecha_venta DATE NOT NULL, -- Sale/delivery date
    
    -- Sales survey questions (1-10 scale) - similar to post-sale but different questions
    recomendacion INTEGER CHECK (recomendacion >= 1 AND recomendacion <= 10), -- Would recommend dealership
    atencion_asesor INTEGER CHECK (atencion_asesor >= 1 AND atencion_asesor <= 10), -- Sales advisor service
    proceso_entrega INTEGER CHECK (proceso_entrega >= 1 AND proceso_entrega <= 10), -- Vehicle delivery process  
    satisfaccion_general INTEGER CHECK (satisfaccion_general >= 1 AND satisfaccion_general <= 10), -- Overall satisfaction
    
    -- Optional feedback (same as post-sale)
    comentario TEXT,
    
    -- Calculated average (same logic as post-sale)
    average_score DECIMAL(3,2),
    
    -- Survey origin tracking (same as post-sale but with VENTAS suffix)
    origen VARCHAR(20) CHECK (origen IN ('QR_VENTAS', 'WhatsApp_VENTAS', 'Llamada_VENTAS')) NOT NULL DEFAULT 'QR_VENTAS',
    
    -- Survey state (same as post-sale)
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado')),
    
    -- Contact center assignment (same as post-sale)
    contact_center_user_id UUID REFERENCES public.usuarios(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint similar to post-sale surveys
    UNIQUE(concesionario_id, cliente_telefono, fecha_venta)
);

-- Create indexes (similar to post-sale surveys)
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_concesionario_origen ON public.encuestas_ventas(concesionario_id, origen);
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_asesor_ventas ON public.encuestas_ventas(asesor_ventas_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_contact_center_user ON public.encuestas_ventas(contact_center_user_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_estado ON public.encuestas_ventas(estado);
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_fecha_venta ON public.encuestas_ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_encuestas_ventas_average_score ON public.encuestas_ventas(average_score);

-- Enable Row Level Security (same as all tables)
ALTER TABLE public.encuestas_ventas ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Tenant isolated (same pattern as other tables)
CREATE POLICY "Encuestas ventas are tenant isolated" ON public.encuestas_ventas FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Function to calculate sales survey average (same logic as post-sale surveys)
CREATE OR REPLACE FUNCTION calculate_sales_survey_average()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate average only when survey is completed with all required scores
    IF NEW.estado = 'completado' AND (
        NEW.recomendacion IS NOT NULL AND 
        NEW.atencion_asesor IS NOT NULL AND 
        NEW.proceso_entrega IS NOT NULL AND 
        NEW.satisfaccion_general IS NOT NULL
    ) THEN
        -- Calculate average of the 4 sales questions
        NEW.average_score = (NEW.recomendacion + NEW.atencion_asesor + NEW.proceso_entrega + NEW.satisfaccion_general) / 4.0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate sales survey average (same pattern)
CREATE TRIGGER trigger_calculate_sales_survey_average
    BEFORE INSERT OR UPDATE ON public.encuestas_ventas
    FOR EACH ROW
    EXECUTE FUNCTION calculate_sales_survey_average();

-- Add jefe_ventas role if not exists (required for sales surveys)
DO $$
BEGIN
    -- Check if jefe_ventas role constraint exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'usuarios_role_check' 
        AND check_clause LIKE '%jefe_ventas%'
    ) THEN
        -- Drop old constraint and add new one with jefe_ventas
        ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_role_check;
        
        ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_role_check 
        CHECK (role IN (
            'super_admin', 'gerencia', 'jefe_servicio', 'asesor_servicio', 
            'contact_center', 'encargado_calidad', 'responsable_contact_center',
            'asesor_ventas', 'jefe_ventas'
        ));
    END IF;
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_sales_survey_average() TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.encuestas_ventas IS 'Customer satisfaction surveys after vehicle purchase - similar to post-sale service surveys';
COMMENT ON COLUMN public.encuestas_ventas.recomendacion IS 'Would recommend dealership (1-10)';
COMMENT ON COLUMN public.encuestas_ventas.atencion_asesor IS 'Sales advisor service quality (1-10)';
COMMENT ON COLUMN public.encuestas_ventas.proceso_entrega IS 'Vehicle delivery process satisfaction (1-10)';  
COMMENT ON COLUMN public.encuestas_ventas.satisfaccion_general IS 'Overall purchase experience (1-10)';
COMMENT ON COLUMN public.encuestas_ventas.origen IS 'QR_VENTAS (immediate), WhatsApp_VENTAS (bulk upload), Llamada_VENTAS (call center)';
COMMENT ON COLUMN public.encuestas_ventas.asesor_ventas_id IS 'Sales advisor who handled the vehicle sale';