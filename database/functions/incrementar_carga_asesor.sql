-- Función para incrementar la carga de trabajo de un asesor
-- Utilizada por N8N workflows al asignar nuevos leads

CREATE OR REPLACE FUNCTION incrementar_carga_asesor(p_asesor_id UUID)
RETURNS JSON AS $$
DECLARE
    v_carga_actual INTEGER;
    v_resultado JSON;
BEGIN
    -- Verificar que el asesor existe y está activo
    IF NOT EXISTS (
        SELECT 1 FROM public.usuarios 
        WHERE id = p_asesor_id 
        AND activo = true 
        AND role IN ('asesor_ventas', 'asesor_servicio')
    ) THEN
        RAISE EXCEPTION 'Asesor no encontrado o inactivo: %', p_asesor_id;
    END IF;

    -- Obtener carga actual y incrementar
    UPDATE public.usuarios 
    SET carga_actual = COALESCE(carga_actual, 0) + 1,
        updated_at = NOW()
    WHERE id = p_asesor_id
    RETURNING carga_actual INTO v_carga_actual;

    -- Preparar respuesta
    v_resultado := json_build_object(
        'asesor_id', p_asesor_id,
        'nueva_carga', v_carga_actual,
        'timestamp', NOW(),
        'status', 'success'
    );

    RETURN v_resultado;

EXCEPTION
    WHEN OTHERS THEN
        -- Manejar errores
        v_resultado := json_build_object(
            'asesor_id', p_asesor_id,
            'status', 'error',
            'error_message', SQLERRM,
            'timestamp', NOW()
        );
        RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos para que N8N pueda ejecutar la función
GRANT EXECUTE ON FUNCTION incrementar_carga_asesor(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION incrementar_carga_asesor(UUID) TO anon;

-- Comentario para documentación
COMMENT ON FUNCTION incrementar_carga_asesor(UUID) IS 
'Incrementa la carga de trabajo de un asesor cuando se le asigna un nuevo lead. Utilizada por workflows de N8N.';
