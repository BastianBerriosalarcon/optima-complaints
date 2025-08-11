-- RLS Policies para tablas críticas de conectividad
-- Fecha: 2025-08-11
-- Propósito: Seguridad multitenant para nuevas tablas

-- =====================================================
-- HABILITAR RLS EN TODAS LAS TABLAS NUEVAS
-- =====================================================
ALTER TABLE configuraciones_concesionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE integraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates_comunicacion ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA CONFIGURACIONES_CONCESIONARIO
-- =====================================================

-- Solo usuarios del mismo concesionario pueden ver/editar configuraciones
CREATE POLICY "configuraciones_tenant_isolation" ON configuraciones_concesionario
    FOR ALL USING (
        concesionario_id = (
            SELECT concesionario_id 
            FROM users 
            WHERE user_id = auth.uid()
        )
    );

-- Super usuarios pueden ver todas las configuraciones
CREATE POLICY "configuraciones_super_user_access" ON configuraciones_concesionario
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() 
            AND role = 'super_user'
        )
    );

-- =====================================================
-- POLÍTICAS PARA INTEGRACIONES
-- =====================================================

-- Solo usuarios del mismo concesionario pueden gestionar integraciones
CREATE POLICY "integraciones_tenant_isolation" ON integraciones
    FOR ALL USING (
        concesionario_id = (
            SELECT concesionario_id 
            FROM users 
            WHERE user_id = auth.uid()
        )
    );

-- Super usuarios pueden ver todas las integraciones
CREATE POLICY "integraciones_super_user_access" ON integraciones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() 
            AND role = 'super_user'
        )
    );

-- =====================================================
-- POLÍTICAS PARA NOTIFICACIONES
-- =====================================================

-- Usuarios pueden ver notificaciones de su concesionario
CREATE POLICY "notificaciones_tenant_isolation" ON notificaciones
    FOR SELECT USING (
        concesionario_id = (
            SELECT concesionario_id 
            FROM users 
            WHERE user_id = auth.uid()
        )
    );

-- Usuarios pueden ver sus propias notificaciones
CREATE POLICY "notificaciones_user_own" ON notificaciones
    FOR SELECT USING (
        usuario_id = auth.uid()
    );

-- Sistema (service role) puede insertar/actualizar notificaciones
CREATE POLICY "notificaciones_system_access" ON notificaciones
    FOR ALL USING (true);

-- Super usuarios pueden ver todas las notificaciones
CREATE POLICY "notificaciones_super_user_access" ON notificaciones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() 
            AND role = 'super_user'
        )
    );

-- =====================================================
-- POLÍTICAS PARA TEMPLATES_COMUNICACION
-- =====================================================

-- Solo usuarios del mismo concesionario pueden gestionar templates
CREATE POLICY "templates_tenant_isolation" ON templates_comunicacion
    FOR ALL USING (
        concesionario_id = (
            SELECT concesionario_id 
            FROM users 
            WHERE user_id = auth.uid()
        )
    );

-- Super usuarios pueden ver todos los templates
CREATE POLICY "templates_super_user_access" ON templates_comunicacion
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() 
            AND role = 'super_user'
        )
    );

-- =====================================================
-- COMENTARIOS EN POLÍTICAS
-- =====================================================
COMMENT ON POLICY "configuraciones_tenant_isolation" ON configuraciones_concesionario IS 'Aislamiento por tenant - solo configuraciones del concesionario del usuario';
COMMENT ON POLICY "integraciones_tenant_isolation" ON integraciones IS 'Aislamiento por tenant - solo integraciones del concesionario del usuario';
COMMENT ON POLICY "notificaciones_tenant_isolation" ON notificaciones IS 'Aislamiento por tenant - solo notificaciones del concesionario del usuario';
COMMENT ON POLICY "templates_tenant_isolation" ON templates_comunicacion IS 'Aislamiento por tenant - solo templates del concesionario del usuario';
