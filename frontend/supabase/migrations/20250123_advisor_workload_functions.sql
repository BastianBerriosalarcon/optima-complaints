-- Create advisor workload log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.advisor_workload_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asesor_id UUID NOT NULL REFERENCES public.usuarios(id),
    action TEXT NOT NULL CHECK (action IN ('increment', 'decrement')),
    previous_load INTEGER NOT NULL DEFAULT 0,
    new_load INTEGER NOT NULL DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the advisor workload log table
ALTER TABLE public.advisor_workload_log ENABLE ROW LEVEL SECURITY;

-- Create policy for advisor workload log table
CREATE POLICY "Advisor workload log is tenant isolated" ON public.advisor_workload_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = advisor_workload_log.asesor_id 
            AND concesionario_id::text = auth.jwt() ->> 'concesionario_id'
        )
    );

-- Function to increment advisor workload
CREATE OR REPLACE FUNCTION incrementar_carga_asesor(p_asesor_id UUID)
RETURNS VOID AS $$
DECLARE
    v_previous_load INTEGER;
    v_new_load INTEGER;
BEGIN
    -- Get current load and update
    UPDATE public.usuarios 
    SET carga_actual = COALESCE(carga_actual, 0) + 1,
        updated_at = NOW()
    WHERE id = p_asesor_id 
    AND role = 'asesor_ventas' 
    AND activo = true
    RETURNING COALESCE(carga_actual, 0) - 1, COALESCE(carga_actual, 0) 
    INTO v_previous_load, v_new_load;
    
    -- Only log if the update was successful
    IF FOUND THEN
        INSERT INTO public.advisor_workload_log (
            asesor_id, 
            action, 
            previous_load, 
            new_load, 
            timestamp
        ) VALUES (
            p_asesor_id,
            'increment',
            v_previous_load,
            v_new_load,
            NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement advisor workload
CREATE OR REPLACE FUNCTION decrementar_carga_asesor(p_asesor_id UUID)
RETURNS VOID AS $$
DECLARE
    v_previous_load INTEGER;
    v_new_load INTEGER;
BEGIN
    -- Get current load and update
    UPDATE public.usuarios 
    SET carga_actual = GREATEST(COALESCE(carga_actual, 0) - 1, 0),
        updated_at = NOW()
    WHERE id = p_asesor_id 
    AND role = 'asesor_ventas' 
    AND activo = true
    RETURNING COALESCE(carga_actual, 0) + 1, COALESCE(carga_actual, 0)
    INTO v_previous_load, v_new_load;
    
    -- Only log if the update was successful
    IF FOUND THEN
        INSERT INTO public.advisor_workload_log (
            asesor_id, 
            action, 
            previous_load, 
            new_load, 
            timestamp
        ) VALUES (
            p_asesor_id,
            'decrement',
            v_previous_load,
            v_new_load,
            NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION incrementar_carga_asesor(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrementar_carga_asesor(UUID) TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION incrementar_carga_asesor(UUID) IS 'Increments the workload (carga_actual) for a sales advisor and logs the change';
COMMENT ON FUNCTION decrementar_carga_asesor(UUID) IS 'Decrements the workload (carga_actual) for a sales advisor and logs the change, with minimum value of 0';
COMMENT ON TABLE public.advisor_workload_log IS 'Audit log for advisor workload changes, tracks increments and decrements with timestamps';