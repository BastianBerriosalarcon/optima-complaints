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

ALTER TABLE public.concesionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reclamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_conocimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA CONCESIONARIOS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admin can view all concesionarios" ON public.concesionarios;
DROP POLICY IF EXISTS "Users can view own concesionario" ON public.concesionarios;
DROP POLICY IF EXISTS "Super admin can manage concesionarios" ON public.concesionarios;

CREATE POLICY "Super admin can view all concesionarios" ON public.concesionarios
    FOR SELECT USING (auth.is_super_admin());

CREATE POLICY "Users can view own concesionario" ON public.concesionarios
    FOR SELECT USING (id = auth.get_user_concesionario_id());

CREATE POLICY "Super admin can manage concesionarios" ON public.concesionarios
    FOR ALL USING (auth.is_super_admin());

-- =====================================================
-- POLÍTICAS PARA USUARIOS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own concesionario users" ON public.usuarios;
DROP POLICY IF EXISTS "Concesionario admin can manage users" ON public.usuarios;

CREATE POLICY "Users can view own concesionario users" ON public.usuarios
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
    );

CREATE POLICY "Concesionario admin can manage users" ON public.usuarios
    FOR ALL USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas'))
        OR auth.is_super_admin()
    );

-- =====================================================
-- POLÍTICAS PARA LEADS (CRÍTICAS)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own concesionario leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads in own concesionario" ON public.leads;
DROP POLICY IF EXISTS "Sales team can update leads" ON public.leads;
DROP POLICY IF EXISTS "Service role can access all leads" ON public.leads;

-- Ver leads del concesionario
CREATE POLICY "Users can view own concesionario leads" ON public.leads
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

-- Crear leads en su concesionario
CREATE POLICY "Users can create leads in own concesionario" ON public.leads
    FOR INSERT WITH CHECK (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

-- Actualizar leads (asesores solo los suyos)
CREATE POLICY "Sales team can update leads" ON public.leads
    FOR UPDATE USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND (
             auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas') OR
             asesor_asignado_id = auth.get_current_user_id()
         ))
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

-- Service role (N8N) puede acceder a todo
CREATE POLICY "Service role can access all leads" ON public.leads
    FOR ALL USING (auth.is_system_user());

-- =====================================================
-- POLÍTICAS PARA ENCUESTAS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own concesionario encuestas" ON public.encuestas;
DROP POLICY IF EXISTS "Users can create encuestas in own concesionario" ON public.encuestas;
DROP POLICY IF EXISTS "Service team can update encuestas" ON public.encuestas;
DROP POLICY IF EXISTS "Service role can access all encuestas" ON public.encuestas;

CREATE POLICY "Users can view own concesionario encuestas" ON public.encuestas
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Users can create encuestas in own concesionario" ON public.encuestas
    FOR INSERT WITH CHECK (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Service team can update encuestas" ON public.encuestas
    FOR UPDATE USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND auth.get_user_role() IN ('admin_concesionario', 'jefe_servicio', 'asesor_servicio', 'contact_center', 'encargado_calidad'))
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Service role can access all encuestas" ON public.encuestas
    FOR ALL USING (auth.is_system_user());

-- =====================================================
-- POLÍTICAS PARA RECLAMOS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own concesionario reclamos" ON public.reclamos;
DROP POLICY IF EXISTS "Users can create reclamos in own concesionario" ON public.reclamos;
DROP POLICY IF EXISTS "Service team can update reclamos" ON public.reclamos;
DROP POLICY IF EXISTS "Service role can access all reclamos" ON public.reclamos;

CREATE POLICY "Users can view own concesionario reclamos" ON public.reclamos
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Users can create reclamos in own concesionario" ON public.reclamos
    FOR INSERT WITH CHECK (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Service team can update reclamos" ON public.reclamos
    FOR UPDATE USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND auth.get_user_role() IN ('admin_concesionario', 'jefe_servicio', 'asesor_servicio', 'encargado_calidad'))
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Service role can access all reclamos" ON public.reclamos
    FOR ALL USING (auth.is_system_user());

-- =====================================================
-- POLÍTICAS PARA PRODUCTOS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own concesionario productos" ON public.productos;
DROP POLICY IF EXISTS "Admin and gerente can manage productos" ON public.productos;

CREATE POLICY "Users can view own concesionario productos" ON public.productos
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Admin and gerente can manage productos" ON public.productos
    FOR ALL USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas'))
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

-- =====================================================
-- POLÍTICAS PARA CONFIGURACIÓN
-- =====================================================

DROP POLICY IF EXISTS "Users can view own concesionario config" ON public.tenant_config;
DROP POLICY IF EXISTS "Concesionario admin can manage config" ON public.tenant_config;
DROP POLICY IF EXISTS "Service role can access all config" ON public.tenant_config;

CREATE POLICY "Users can view own concesionario config" ON public.tenant_config
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Concesionario admin can manage config" ON public.tenant_config
    FOR ALL USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND auth.get_user_role() = 'admin_concesionario')
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Service role can access all config" ON public.tenant_config
    FOR ALL USING (auth.is_system_user());

-- =====================================================
-- APLICAR POLÍTICAS A TABLAS RESTANTES
-- =====================================================

-- Cotizaciones
DROP POLICY IF EXISTS "Users can view own concesionario cotizaciones" ON public.cotizaciones;
DROP POLICY IF EXISTS "Sales team can create cotizaciones" ON public.cotizaciones;
DROP POLICY IF EXISTS "Sales team can update own cotizaciones" ON public.cotizaciones;

CREATE POLICY "Users can view own concesionario cotizaciones" ON public.cotizaciones
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Sales team can create cotizaciones" ON public.cotizaciones
    FOR INSERT WITH CHECK (
        concesionario_id = auth.get_user_concesionario_id() 
        AND auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas', 'asesor_ventas')
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Sales team can update own cotizaciones" ON public.cotizaciones
    FOR UPDATE USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND (
             auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas') OR
             asesor_id = auth.get_current_user_id()
         ))
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

-- Ventas
DROP POLICY IF EXISTS "Users can view own concesionario ventas" ON public.ventas;
DROP POLICY IF EXISTS "Sales team can create ventas" ON public.ventas;
DROP POLICY IF EXISTS "Sales team can update own ventas" ON public.ventas;

CREATE POLICY "Users can view own concesionario ventas" ON public.ventas
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Sales team can create ventas" ON public.ventas
    FOR INSERT WITH CHECK (
        concesionario_id = auth.get_user_concesionario_id() 
        AND auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas', 'asesor_ventas')
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Sales team can update own ventas" ON public.ventas
    FOR UPDATE USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND (
             auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas') OR
             asesor_id = auth.get_current_user_id()
         ))
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

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