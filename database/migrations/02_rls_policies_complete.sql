-- =====================================================
-- OptimaCx - RLS Policies Completas y Funciones Helper
-- Migración: 02_rls_policies_complete.sql
-- =====================================================

-- =====================================================
-- FUNCIONES HELPER PARA RLS
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

-- Función para verificar acceso a lead específico
CREATE OR REPLACE FUNCTION auth.can_user_access_lead(lead_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    lead_record RECORD;
    user_role TEXT;
    user_concesionario UUID;
    current_user_id UUID;
BEGIN
    -- Obtener información del usuario
    user_role := auth.get_user_role();
    user_concesionario := auth.get_user_concesionario_id();
    current_user_id := auth.get_current_user_id();
    
    -- Super admin puede acceder a todo
    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Obtener información del lead
    SELECT concesionario_id, asesor_asignado_id INTO lead_record
    FROM public.leads 
    WHERE id = lead_id;
    
    -- Verificar si pertenece al mismo concesionario
    IF lead_record.concesionario_id != user_concesionario THEN
        RETURN FALSE;
    END IF;
    
    -- Admin y gerente pueden ver todos los leads de su concesionario
    IF user_role IN ('admin_concesionario', 'gerente_ventas') THEN
        RETURN TRUE;
    END IF;
    
    -- Asesor solo puede ver sus leads asignados
    IF user_role = 'asesor_ventas' AND lead_record.asesor_asignado_id = current_user_id THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

-- Habilitar RLS en todas las tablas relevantes
ALTER TABLE public.concesionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reclamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;

-- Políticas para Concesionarios
CREATE POLICY "Users can view own concesionario" ON public.concesionarios
    FOR SELECT USING (id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Políticas para Sucursales
CREATE POLICY "Users can view own concesionario sucursales" ON public.sucursales
    FOR SELECT USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Políticas para Usuarios
CREATE POLICY "Users can view own concesionario users" ON public.usuarios
    FOR SELECT USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

CREATE POLICY "Users can manage own user" ON public.usuarios
    FOR ALL USING (id = auth.uid());

-- Políticas para Clientes
CREATE POLICY "Users can view own concesionario clientes" ON public.clientes
    FOR SELECT USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Políticas para Vehículos
CREATE POLICY "Users can view own concesionario vehiculos" ON public.vehiculos
    FOR SELECT USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Políticas para Servicios
CREATE POLICY "Users can view own concesionario servicios" ON public.servicios
    FOR SELECT USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Políticas para Reclamos
CREATE POLICY "Users can view own concesionario reclamos" ON public.reclamos
    FOR SELECT USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Políticas para Tenant Config
CREATE POLICY "Users can view own tenant_config" ON public.tenant_config
    FOR SELECT USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- =====================================================
-- VERIFICACIÓN DE APLICACIÓN
-- =====================================================

-- Crear vista para verificar RLS
CREATE OR REPLACE VIEW public.rls_status AS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = pg_tables.tablename) as policies_count
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('concesionarios', 'sucursales', 'usuarios', 'leads', 'productos', 'cotizaciones', 'ventas', 'encuestas', 'reclamos', 'tenant_config')
ORDER BY tablename;

-- Mensaje de confirmación
SELECT 'RLS Policies aplicadas correctamente para seguridad multitenant' as status;