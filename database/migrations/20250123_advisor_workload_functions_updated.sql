-- Enhanced advisor workload management for N8N workflows
-- Supports both asesor_ventas AND jefe_ventas/gerente_ventas roles as per project requirements

-- Add workload field to usuarios table if not exists
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS carga_actual INTEGER DEFAULT 0;

-- Add specialization field for vehicle expertise
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS especialidad TEXT;

-- Create index for performance optimization
CREATE INDEX IF NOT EXISTS idx_usuarios_sales_workload 
ON public.usuarios (concesionario_id, role, activo, carga_actual) 
WHERE role IN ('asesor_ventas', 'jefe_ventas', 'gerente_ventas');

-- Create advisor workload log table if it doesn't exist (enhanced version)
CREATE TABLE IF NOT EXISTS public.advisor_workload_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asesor_id UUID NOT NULL REFERENCES public.usuarios(id),
    action TEXT NOT NULL CHECK (action IN ('increment', 'decrement')),
    previous_load INTEGER NOT NULL DEFAULT 0,
    new_load INTEGER NOT NULL DEFAULT 0,
    lead_id UUID, -- Optional reference to lead that caused the change
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the advisor workload log table
ALTER TABLE public.advisor_workload_log ENABLE ROW LEVEL SECURITY;

-- Create policy for advisor workload log table (tenant isolated)
DROP POLICY IF EXISTS "Advisor workload log is tenant isolated" ON public.advisor_workload_log;
CREATE POLICY "Advisor workload log is tenant isolated" ON public.advisor_workload_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = advisor_workload_log.asesor_id 
            AND concesionario_id = auth.jwt() ->> 'concesionario_id'
        )
    );

-- Function to increment workload for sales team (both asesor and jefe)
CREATE OR REPLACE FUNCTION incrementar_carga_asesor(p_asesor_id UUID, p_lead_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    v_previous_load INTEGER;
    v_new_load INTEGER;
    v_role TEXT;
BEGIN
    -- Get current load and role, then update
    UPDATE public.usuarios 
    SET carga_actual = COALESCE(carga_actual, 0) + 1,
        updated_at = NOW()
    WHERE id = p_asesor_id 
    AND role IN ('asesor_ventas', 'jefe_ventas', 'gerente_ventas') 
    AND activo = true
    RETURNING COALESCE(carga_actual, 0) - 1, COALESCE(carga_actual, 0), role
    INTO v_previous_load, v_new_load, v_role;
    
    -- Verify the update happened
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo actualizar la carga del asesor con ID: %. Verificar que el usuario existe, está activo y tiene rol de ventas.', p_asesor_id;
    END IF;
    
    -- Log the workload change
    INSERT INTO public.advisor_workload_log (
        asesor_id, 
        action, 
        previous_load, 
        new_load,
        lead_id,
        timestamp
    ) VALUES (
        p_asesor_id,
        'increment',
        v_previous_load,
        v_new_load,
        p_lead_id,
        NOW()
    );
    
    -- Log successful increment
    RAISE NOTICE 'Carga incrementada para % (rol: %): % -> %', p_asesor_id, v_role, v_previous_load, v_new_load;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement workload for sales team 
CREATE OR REPLACE FUNCTION decrementar_carga_asesor(p_asesor_id UUID, p_lead_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    v_previous_load INTEGER;
    v_new_load INTEGER;
    v_role TEXT;
BEGIN
    -- Get current load and role, then update (minimum 0)
    UPDATE public.usuarios 
    SET carga_actual = GREATEST(COALESCE(carga_actual, 0) - 1, 0),
        updated_at = NOW()
    WHERE id = p_asesor_id 
    AND role IN ('asesor_ventas', 'jefe_ventas', 'gerente_ventas') 
    AND activo = true
    RETURNING COALESCE(carga_actual, 0) + 1, COALESCE(carga_actual, 0), role
    INTO v_previous_load, v_new_load, v_role;
    
    -- Verify the update happened
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo actualizar la carga del asesor con ID: %. Verificar que el usuario existe, está activo y tiene rol de ventas.', p_asesor_id;
    END IF;
    
    -- Log the workload change
    INSERT INTO public.advisor_workload_log (
        asesor_id, 
        action, 
        previous_load, 
        new_load,
        lead_id,
        timestamp
    ) VALUES (
        p_asesor_id,
        'decrement',
        v_previous_load,
        v_new_load,
        p_lead_id,
        NOW()
    );
    
    -- Log successful decrement
    RAISE NOTICE 'Carga decrementada para % (rol: %): % -> %', p_asesor_id, v_role, v_previous_load, v_new_load;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available sales team (both asesor and jefe) with intelligent assignment
CREATE OR REPLACE FUNCTION get_available_sales_team(
    p_concesionario_id UUID,
    p_sucursal_id UUID DEFAULT NULL,
    p_especialidad TEXT DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    nombre VARCHAR,
    role VARCHAR,
    carga_actual INTEGER,
    especialidad TEXT,
    sucursal_id UUID,
    sucursal_nombre VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nombre,
        u.role,
        COALESCE(u.carga_actual, 0) as carga_actual,
        u.especialidad,
        u.sucursal_id,
        s.nombre as sucursal_nombre
    FROM public.usuarios u
    LEFT JOIN public.sucursales s ON u.sucursal_id = s.id
    WHERE u.concesionario_id = p_concesionario_id
    AND u.role IN ('asesor_ventas', 'jefe_ventas', 'gerente_ventas')
    AND u.activo = true
    AND (p_sucursal_id IS NULL OR u.sucursal_id = p_sucursal_id)
    AND (p_especialidad IS NULL OR u.especialidad IS NULL OR u.especialidad ILIKE '%' || p_especialidad || '%')
    ORDER BY 
        -- Prioritize by role hierarchy (gerente > jefe > asesor for escalation)
        CASE u.role 
            WHEN 'gerente_ventas' THEN 1
            WHEN 'jefe_ventas' THEN 2  
            WHEN 'asesor_ventas' THEN 3
        END,
        -- Then by specialization match (exact match first)
        CASE 
            WHEN p_especialidad IS NOT NULL AND u.especialidad = p_especialidad THEN 1
            WHEN p_especialidad IS NOT NULL AND u.especialidad ILIKE '%' || p_especialidad || '%' THEN 2
            WHEN u.especialidad IS NULL THEN 3
            ELSE 4
        END,
        -- Then by lowest workload
        COALESCE(u.carga_actual, 0) ASC,
        -- Finally by creation date (oldest first as tiebreaker)
        u.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get advisor workload statistics
CREATE OR REPLACE FUNCTION get_advisor_workload_stats(
    p_concesionario_id UUID,
    p_fecha_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    asesor_id UUID,
    asesor_nombre VARCHAR,
    role VARCHAR,
    carga_actual INTEGER,
    total_incrementos BIGINT,
    total_decrementos BIGINT,
    cambios_netos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as asesor_id,
        u.nombre as asesor_nombre,
        u.role,
        COALESCE(u.carga_actual, 0) as carga_actual,
        COALESCE(SUM(CASE WHEN awl.action = 'increment' THEN 1 ELSE 0 END), 0) as total_incrementos,
        COALESCE(SUM(CASE WHEN awl.action = 'decrement' THEN 1 ELSE 0 END), 0) as total_decrementos,
        COALESCE(SUM(CASE WHEN awl.action = 'increment' THEN 1 WHEN awl.action = 'decrement' THEN -1 ELSE 0 END), 0) as cambios_netos
    FROM public.usuarios u
    LEFT JOIN public.advisor_workload_log awl ON u.id = awl.asesor_id 
        AND DATE(awl.timestamp) BETWEEN p_fecha_inicio AND p_fecha_fin
    WHERE u.concesionario_id = p_concesionario_id
    AND u.role IN ('asesor_ventas', 'jefe_ventas', 'gerente_ventas')
    AND u.activo = true
    GROUP BY u.id, u.nombre, u.role, u.carga_actual
    ORDER BY u.role, u.nombre;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION incrementar_carga_asesor(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrementar_carga_asesor(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_sales_team(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_advisor_workload_stats(UUID, DATE, DATE) TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION incrementar_carga_asesor(UUID, UUID) IS 'Increments workload for sales team (asesor_ventas, jefe_ventas, gerente_ventas) with optional lead tracking';
COMMENT ON FUNCTION decrementar_carga_asesor(UUID, UUID) IS 'Decrements workload for sales team (asesor_ventas, jefe_ventas, gerente_ventas) with optional lead tracking, minimum 0';
COMMENT ON FUNCTION get_available_sales_team(UUID, UUID, TEXT) IS 'Returns available sales team members ordered by role hierarchy, specialization match, and workload';
COMMENT ON FUNCTION get_advisor_workload_stats(UUID, DATE, DATE) IS 'Returns workload statistics for sales team over specified date range';

COMMENT ON COLUMN public.usuarios.carga_actual IS 'Current workload count for sales team members';
COMMENT ON COLUMN public.usuarios.especialidad IS 'Vehicle/brand specialization for targeted lead assignment';
COMMENT ON TABLE public.advisor_workload_log IS 'Audit log for sales team workload changes, tracks all increments/decrements with lead references';