-- =====================================================
-- OptimaCx - Funciones Helper para RLS
-- Parte 1: Funciones de utilidad
-- =====================================================

-- Función para obtener el concesionario_id del usuario desde metadatos
CREATE OR REPLACE FUNCTION auth.get_user_concesionario_id()
RETURNS UUID AS $$
DECLARE
    user_metadata JSONB;
    concesionario_id UUID;
BEGIN
    -- Obtener metadatos del usuario autenticado
    SELECT raw_user_meta_data INTO user_metadata 
    FROM auth.users 
    WHERE id = auth.uid();
    
    IF user_metadata IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Extraer concesionario_id de los metadatos
    concesionario_id := (user_metadata ->> 'concesionario_id')::UUID;
    
    RETURN concesionario_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el rol del usuario desde metadatos
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_metadata JSONB;
    user_role TEXT;
BEGIN
    -- Obtener metadatos del usuario autenticado
    SELECT raw_user_meta_data INTO user_metadata 
    FROM auth.users 
    WHERE id = auth.uid();
    
    IF user_metadata IS NULL THEN
        RETURN 'anonymous';
    END IF;
    
    -- Extraer rol de los metadatos
    user_role := user_metadata ->> 'role';
    
    RETURN COALESCE(user_role, 'anonymous');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el user_id actual
CREATE OR REPLACE FUNCTION auth.get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si es super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.get_user_role() = 'super_admin';
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si es usuario del sistema (service_role)
CREATE OR REPLACE FUNCTION auth.is_system_user()
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar si el rol actual es service_role
    RETURN auth.jwt() ->> 'role' = 'service_role';
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;