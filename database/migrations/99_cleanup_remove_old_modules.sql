-- ============================================================================
-- CLEANUP MIGRATION: Remove Leads, Encuestas, Ventas, Chatwoot, WhatsApp
-- Fecha: 2025-10-28
-- Descripción: Elimina tablas y columnas de módulos excluidos en CLAUDE.md
-- Versión: 2.1.0
-- ============================================================================

-- IMPORTANTE: Esta migración es IRREVERSIBLE
-- Crear backup de base de datos ANTES de ejecutar

BEGIN;

-- ============================================================================
-- PASO 1: Eliminar tablas de módulos excluidos
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PASO 1: ELIMINANDO TABLAS DE MÓDULOS EXCLUIDOS ===';
END $$;

-- Eliminar tabla de leads y relacionadas
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.seguimientos_lead CASCADE;
DROP TABLE IF EXISTS public.cotizaciones CASCADE;

-- Eliminar tabla de encuestas
DROP TABLE IF EXISTS public.encuestas CASCADE;
DROP TABLE IF EXISTS public.encuestas_postventa CASCADE;
DROP TABLE IF EXISTS public.encuestas_ventas CASCADE;
DROP TABLE IF EXISTS public.interacciones_encuesta CASCADE;

-- Eliminar tabla de ventas
DROP TABLE IF EXISTS public.ventas CASCADE;
DROP TABLE IF EXISTS public.productos CASCADE;

-- Eliminar métricas de encuestas
DROP TABLE IF EXISTS public.metricas_dashboard_encuestas CASCADE;

-- Eliminar campañas de marketing
DROP TABLE IF EXISTS public.campanas CASCADE;
DROP TABLE IF EXISTS public.campanas_envios CASCADE;

DO $$
BEGIN
    RAISE NOTICE 'Tablas de módulos excluidos eliminadas exitosamente';
END $$;


-- ============================================================================
-- PASO 2: Limpiar columnas de Chatwoot en tenant_configurations
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PASO 2: LIMPIANDO COLUMNAS DE CHATWOOT ===';
END $$;

-- Eliminar índices relacionados con Chatwoot
DROP INDEX IF EXISTS idx_tenant_configurations_chatwoot;

-- Eliminar función helper de Chatwoot
DROP FUNCTION IF EXISTS get_tenant_by_chatwoot_account(INTEGER);

-- Verificar si las columnas existen antes de eliminarlas
DO $$
BEGIN
    -- Eliminar chatwoot_account_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'tenant_configurations'
        AND column_name = 'chatwoot_account_id'
    ) THEN
        ALTER TABLE public.tenant_configurations DROP COLUMN chatwoot_account_id CASCADE;
        RAISE NOTICE 'Columna chatwoot_account_id eliminada';
    END IF;

    -- Eliminar chatwoot_webhook_token
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'tenant_configurations'
        AND column_name = 'chatwoot_webhook_token'
    ) THEN
        ALTER TABLE public.tenant_configurations DROP COLUMN chatwoot_webhook_token CASCADE;
        RAISE NOTICE 'Columna chatwoot_webhook_token eliminada';
    END IF;

    -- Eliminar chatwoot_api_access_token
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'tenant_configurations'
        AND column_name = 'chatwoot_api_access_token'
    ) THEN
        ALTER TABLE public.tenant_configurations DROP COLUMN chatwoot_api_access_token CASCADE;
        RAISE NOTICE 'Columna chatwoot_api_access_token eliminada';
    END IF;
END $$;


-- ============================================================================
-- PASO 3: Limpiar configuraciones JSON de WhatsApp
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PASO 3: LIMPIANDO CONFIGURACIONES DE WHATSAPP ===';
END $$;

-- Verificar si existe la tabla tenant_configurations
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_configurations') THEN
        -- Limpiar whatsapp de email_config si existe como objeto JSON
        UPDATE public.tenant_configurations
        SET email_config = email_config - 'whatsapp'
        WHERE email_config ? 'whatsapp';

        RAISE NOTICE 'Referencias WhatsApp eliminadas de email_config';
    END IF;
END $$;

-- Eliminar columna whatsapp_config si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'tenant_configurations'
        AND column_name = 'whatsapp_config'
    ) THEN
        ALTER TABLE public.tenant_configurations DROP COLUMN whatsapp_config CASCADE;
        RAISE NOTICE 'Columna whatsapp_config eliminada';
    END IF;
END $$;

-- Eliminar configuracion_whatsapp si existe en concesionarios
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'concesionarios'
        AND column_name = 'configuracion_whatsapp'
    ) THEN
        ALTER TABLE public.concesionarios DROP COLUMN configuracion_whatsapp CASCADE;
        RAISE NOTICE 'Columna configuracion_whatsapp eliminada de concesionarios';
    END IF;

    -- Eliminar configuracion_chatwoot si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'concesionarios'
        AND column_name = 'configuracion_chatwoot'
    ) THEN
        ALTER TABLE public.concesionarios DROP COLUMN configuracion_chatwoot CASCADE;
        RAISE NOTICE 'Columna configuracion_chatwoot eliminada de concesionarios';
    END IF;
END $$;


-- ============================================================================
-- PASO 4: Limpiar roles de usuario relacionados con ventas
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PASO 4: LIMPIANDO ROLES DE VENTAS ===';
END $$;

-- Verificar si existe la tabla usuarios
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN

        -- Reasignar usuarios con roles obsoletos a un rol válido
        -- IMPORTANTE: Revisar manualmente antes de ejecutar en producción
        UPDATE public.usuarios
        SET role = 'asesor_servicio'
        WHERE role IN ('asesor_ventas', 'gerente_ventas', 'jefe_ventas');

        RAISE NOTICE 'Usuarios con roles obsoletos reasignados a asesor_servicio';

        -- Eliminar constraint anterior de roles
        ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_role_check;

        -- Crear nuevo constraint con solo roles de reclamos
        ALTER TABLE public.usuarios
            ADD CONSTRAINT usuarios_role_check
            CHECK (role IN (
                'super_admin',
                'admin_concesionario',
                'jefe_servicio',
                'asesor_servicio',
                'encargado_calidad',
                'contact_center',
                'responsable_contact_center'
            ));

        RAISE NOTICE 'Constraint de roles actualizado a solo roles de reclamos';
    END IF;
END $$;

-- Eliminar columnas relacionadas con ventas de usuarios
DO $$
BEGIN
    -- Eliminar comision_ventas
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'usuarios'
        AND column_name = 'comision_ventas'
    ) THEN
        ALTER TABLE public.usuarios DROP COLUMN comision_ventas CASCADE;
        RAISE NOTICE 'Columna comision_ventas eliminada';
    END IF;

    -- Eliminar meta_mensual
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'usuarios'
        AND column_name = 'meta_mensual'
    ) THEN
        ALTER TABLE public.usuarios DROP COLUMN meta_mensual CASCADE;
        RAISE NOTICE 'Columna meta_mensual eliminada';
    END IF;
END $$;


-- ============================================================================
-- PASO 5: Limpiar funciones y triggers obsoletos
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PASO 5: LIMPIANDO FUNCIONES Y TRIGGERS ===';
END $$;

-- Eliminar funciones relacionadas con advisor workload (leads)
DROP FUNCTION IF EXISTS incrementar_carga_asesor(UUID) CASCADE;
DROP FUNCTION IF EXISTS decrementar_carga_asesor(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_advisor_workload(UUID) CASCADE;
DROP FUNCTION IF EXISTS assign_advisor_auto(UUID) CASCADE;

-- Eliminar triggers de encuestas
DROP TRIGGER IF EXISTS trigger_calcular_promedios_encuesta ON public.encuestas CASCADE;
DROP TRIGGER IF EXISTS trigger_actualizar_nps ON public.encuestas CASCADE;

-- Eliminar funciones de cálculo de encuestas
DROP FUNCTION IF EXISTS calcular_promedios_encuesta() CASCADE;
DROP FUNCTION IF EXISTS actualizar_nps_tenant() CASCADE;

RAISE NOTICE 'Funciones y triggers obsoletos eliminados';


-- ============================================================================
-- PASO 6: Verificación final
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PASO 6: VERIFICACIÓN DE LIMPIEZA ===';
    RAISE NOTICE 'Tablas restantes en schema public:';
END $$;

-- Query para verificar tablas restantes
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar que no existan columnas relacionadas con módulos excluidos
SELECT
    table_name,
    column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name LIKE '%chatwoot%' OR
    column_name LIKE '%whatsapp%' OR
    column_name LIKE '%lead%' OR
    column_name LIKE '%encuesta%' OR
    column_name LIKE '%venta%'
  )
ORDER BY table_name, column_name;


-- ============================================================================
-- PASO 7: Comentarios en tablas restantes
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PASO 7: ACTUALIZANDO COMENTARIOS DE TABLAS ===';
END $$;

-- Actualizar comentarios para reflejar el nuevo alcance
COMMENT ON TABLE public.reclamos IS 'Tabla principal de gestión de reclamos - Módulo único según CLAUDE.md v2.1.0';
COMMENT ON TABLE public.usuarios IS 'Usuarios del sistema - Solo roles relacionados con gestión de reclamos';
COMMENT ON TABLE public.concesionarios IS 'Concesionarios multitenant - Sistema enfocado exclusivamente en reclamos';

-- Comentar tabla de configuraciones si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_configurations') THEN
        COMMENT ON TABLE public.tenant_configurations IS 'Configuraciones multitenant - Limpiado de Chatwoot y WhatsApp';
    END IF;
END $$;


-- ============================================================================
-- PASO 8: Registrar migración en log
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== MIGRACIÓN COMPLETADA EXITOSAMENTE ===';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE 'Versión: 2.1.0';
    RAISE NOTICE 'Descripción: Limpieza de módulos excluidos (Leads, Encuestas, Ventas, WhatsApp, Chatwoot)';
    RAISE NOTICE '';
    RAISE NOTICE 'MÓDULOS ELIMINADOS:';
    RAISE NOTICE '- Sistema completo de Leads Management';
    RAISE NOTICE '- Sistema de Encuestas (Ventas y Post-venta)';
    RAISE NOTICE '- Módulo de Ventas';
    RAISE NOTICE '- Integración WhatsApp Business API';
    RAISE NOTICE '- Integración Chatwoot';
    RAISE NOTICE '- Campañas de Marketing';
    RAISE NOTICE '';
    RAISE NOTICE 'MÓDULO CONSERVADO:';
    RAISE NOTICE '- Gestión de Reclamos con IA y RAG';
    RAISE NOTICE '';
    RAISE NOTICE 'Para rollback, restaurar desde backup creado antes de esta migración';
END $$;

COMMIT;

-- FIN DE MIGRACIÓN
-- ============================================================================
