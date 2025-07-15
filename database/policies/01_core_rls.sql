-- =====================================================
-- OptimaCx Unificado - Row Level Security (RLS)
-- Políticas de seguridad para Ventas + Post-Venta
-- =====================================================

-- Habilitar RLS en todas las tablas
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
-- FUNCIONES DE UTILIDAD PARA RLS
-- =====================================================

-- Función para obtener el concesionario_id del usuario actual
CREATE OR REPLACE FUNCTION auth.get_user_concesionario_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() ->> 'concesionario_id')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es super_admin
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'role') = 'super_admin';
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el rol del usuario
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN auth.jwt() ->> 'role';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION auth.get_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() ->> 'user_id')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si es usuario del sistema (n8n/service_role)
CREATE OR REPLACE FUNCTION auth.is_system_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'role') = 'service_role' OR 
           (auth.jwt() ->> 'iss') = 'supabase';
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS PARA CONCESIONARIOS
-- =====================================================

CREATE POLICY "Super admin can view all concesionarios" ON public.concesionarios
    FOR SELECT USING (auth.is_super_admin());

CREATE POLICY "Users can view own concesionario" ON public.concesionarios
    FOR SELECT USING (id = auth.get_user_concesionario_id());

CREATE POLICY "Super admin can manage concesionarios" ON public.concesionarios
    FOR ALL USING (auth.is_super_admin());

-- =====================================================
-- POLÍTICAS PARA SUCURSALES
-- =====================================================

CREATE POLICY "Users can view own concesionario sucursales" ON public.sucursales
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
    );

CREATE POLICY "Concesionario admin can manage sucursales" ON public.sucursales
    FOR ALL USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas'))
        OR auth.is_super_admin()
    );

-- =====================================================
-- POLÍTICAS PARA USUARIOS
-- =====================================================

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
-- POLÍTICAS PARA LEADS (VENTAS)
-- =====================================================

-- Ver leads de su concesionario
CREATE POLICY "Users can view own concesionario leads" ON public.leads
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
    );

-- Crear leads en su concesionario
CREATE POLICY "Users can create leads in own concesionario" ON public.leads
    FOR INSERT WITH CHECK (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
    );

-- Actualizar leads: asesores ven todos, otros solo los suyos
CREATE POLICY "Sales team can update leads" ON public.leads
    FOR UPDATE USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND (
             auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas') OR
             asesor_asignado_id = auth.get_user_id()
         ))
        OR auth.is_super_admin()
    );

-- =====================================================
-- POLÍTICAS PARA PRODUCTOS
-- =====================================================

CREATE POLICY "Users can view own concesionario productos" ON public.productos
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
    );

CREATE POLICY "Admin and gerente can manage productos" ON public.productos
    FOR ALL USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas'))
        OR auth.is_super_admin()
    );

-- =====================================================
-- POLÍTICAS PARA COTIZACIONES
-- =====================================================

CREATE POLICY "Users can view own concesionario cotizaciones" ON public.cotizaciones
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
    );

CREATE POLICY "Sales team can create cotizaciones" ON public.cotizaciones
    FOR INSERT WITH CHECK (
        concesionario_id = auth.get_user_concesionario_id() 
        AND auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas', 'asesor_ventas')
        OR auth.is_super_admin()
    );

CREATE POLICY "Sales team can update own cotizaciones" ON public.cotizaciones
    FOR UPDATE USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND (
             auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas') OR
             asesor_id = auth.get_user_id()
         ))
        OR auth.is_super_admin()
    );

-- =====================================================
-- POLÍTICAS PARA VENTAS
-- =====================================================

CREATE POLICY "Users can view own concesionario ventas" ON public.ventas
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
    );

CREATE POLICY "Sales team can create ventas" ON public.ventas
    FOR INSERT WITH CHECK (
        concesionario_id = auth.get_user_concesionario_id() 
        AND auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas', 'asesor_ventas')
        OR auth.is_super_admin()
    );

CREATE POLICY "Sales team can update own ventas" ON public.ventas
    FOR UPDATE USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND (
             auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas') OR
             asesor_id = auth.get_user_id()
         ))
        OR auth.is_super_admin()
    );

-- =====================================================
-- POLÍTICAS PARA ENCUESTAS (POST-VENTA)
-- =====================================================

CREATE POLICY "Users can view own concesionario encuestas" ON public.encuestas
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
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

-- =====================================================
-- POLÍTICAS PARA RECLAMOS (POST-VENTA)
-- =====================================================

CREATE POLICY "Users can view own concesionario reclamos" ON public.reclamos
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
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

-- =====================================================
-- POLÍTICAS PARA DOCUMENTOS DE CONOCIMIENTO (RAG)
-- =====================================================

CREATE POLICY "Users can view own concesionario documents" ON public.documentos_conocimiento
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "Authorized roles can manage documents" ON public.documentos_conocimiento
    FOR ALL USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas', 'encargado_calidad'))
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

-- =====================================================
-- POLÍTICAS PARA CHUNKS DE DOCUMENTOS (RAG)
-- =====================================================

CREATE POLICY "Users can view own concesionario chunks" ON public.documento_chunks
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

CREATE POLICY "System can manage chunks" ON public.documento_chunks
    FOR ALL USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
        OR auth.is_system_user()
    );

-- =====================================================
-- POLÍTICAS PARA CONFIGURACIÓN DE TENANT
-- =====================================================

CREATE POLICY "Users can view own concesionario config" ON public.tenant_config
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        OR auth.is_super_admin()
    );

CREATE POLICY "Concesionario admin can manage config" ON public.tenant_config
    FOR ALL USING (
        (concesionario_id = auth.get_user_concesionario_id() 
         AND auth.get_user_role() = 'admin_concesionario')
        OR auth.is_super_admin()
    );

-- =====================================================
-- POLÍTICAS ESPECIALES PARA N8N (SERVICE ROLE)
-- =====================================================

-- n8n puede acceder a todos los datos con service_role key
CREATE POLICY "Service role can access all leads" ON public.leads
    FOR ALL USING (auth.is_system_user());

CREATE POLICY "Service role can access all cotizaciones" ON public.cotizaciones
    FOR ALL USING (auth.is_system_user());

CREATE POLICY "Service role can access all ventas" ON public.ventas
    FOR ALL USING (auth.is_system_user());

CREATE POLICY "Service role can access all encuestas" ON public.encuestas
    FOR ALL USING (auth.is_system_user());

CREATE POLICY "Service role can access all reclamos" ON public.reclamos
    FOR ALL USING (auth.is_system_user());

CREATE POLICY "Service role can access all config" ON public.tenant_config
    FOR ALL USING (auth.is_system_user());

CREATE POLICY "Service role can access all documents" ON public.documentos_conocimiento
    FOR ALL USING (auth.is_system_user());

CREATE POLICY "Service role can access all chunks" ON public.documento_chunks
    FOR ALL USING (auth.is_system_user());

-- =====================================================
-- POLÍTICAS ADICIONALES PARA ROLES ESPECÍFICOS
-- =====================================================

-- Asesores de ventas solo ven sus leads asignados (vista detallada)
CREATE POLICY "Asesor ventas can view assigned leads detail" ON public.leads
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        AND (
            auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas') OR
            asesor_asignado_id = auth.get_user_id()
        )
    );

-- Contact center puede ver encuestas para seguimiento
CREATE POLICY "Contact center can view encuestas for tracking" ON public.encuestas
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        AND auth.get_user_role() IN ('contact_center', 'admin_concesionario', 'encargado_calidad')
    );

-- Marketing puede ver métricas pero no datos personales
CREATE POLICY "Marketing can view aggregated data" ON public.leads
    FOR SELECT USING (
        concesionario_id = auth.get_user_concesionario_id() 
        AND auth.get_user_role() IN ('marketing', 'admin_concesionario', 'gerente_ventas')
    );

-- =====================================================
-- FUNCIONES DE VISTA ESPECÍFICAS POR ROL
-- =====================================================

-- Vista para asesores de ventas (solo sus leads)
CREATE OR REPLACE VIEW public.mis_leads AS
SELECT * FROM public.leads 
WHERE asesor_asignado_id = auth.get_user_id()
   OR auth.get_user_role() IN ('admin_concesionario', 'gerente_ventas')
   OR auth.is_super_admin();

-- Vista para métricas de marketing (datos anonimizados)
CREATE OR REPLACE VIEW public.leads_metricas AS
SELECT 
    concesionario_id,
    DATE_TRUNC('day', created_at) as fecha,
    canal_origen,
    estado,
    COUNT(*) as total_leads,
    AVG(score_calidad) as score_promedio,
    -- Datos personales ocultos para marketing
    NULL as nombre_completo,
    NULL as rut,
    NULL as telefono,
    NULL as email
FROM public.leads 
WHERE concesionario_id = auth.get_user_concesionario_id()
GROUP BY concesionario_id, DATE_TRUNC('day', created_at), canal_origen, estado;

-- RLS para vistas
ALTER VIEW public.mis_leads OWNER TO postgres;
ALTER VIEW public.leads_metricas OWNER TO postgres;