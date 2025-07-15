-- =====================================================
-- OptimaCx - Políticas RLS para tablas principales
-- Parte 3: Políticas para concesionarios, usuarios, leads
-- =====================================================

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