-- Datos iniciales para tablas críticas de conectividad
-- Fecha: 2025-08-11
-- Propósito: Configuraciones base para funcionamiento inmediato

-- =====================================================
-- INSERTAR CONFIGURACIONES BÁSICAS POR CONCESIONARIO
-- =====================================================

-- Insertar configuración para cada concesionario existente
INSERT INTO configuraciones_concesionario (concesionario_id, webhook_n8n_base, configuracion)
SELECT 
    id as concesionario_id,
    'https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app/webhook/' as webhook_n8n_base,
    jsonb_build_object(
        'whatsapp', jsonb_build_object(
            'numero', '',
            'api_key', '',
            'webhook_verify_token', 'webhook_' || LOWER(REPLACE(nombre, ' ', '_'))
        ),
        'email', jsonb_build_object(
            'smtp_host', 'smtp.gmail.com',
            'smtp_port', 587,
            'from_email', 'noreply@' || LOWER(REPLACE(nombre, ' ', '')) || '.com',
            'from_name', nombre
        ),
        'encuestas', jsonb_build_object(
            'envio_automatico', true,
            'dias_espera_whatsapp', 1,
            'horas_espera_llamada', 6,
            'recordatorios_activos', true
        ),
        'branding', jsonb_build_object(
            'logo_url', '',
            'color_primario', '#007bff',
            'color_secundario', '#6c757d',
            'nombre_comercial', nombre
        ),
        'horarios', jsonb_build_object(
            'inicio', '09:00',
            'fin', '18:00',
            'zona_horaria', 'America/Santiago',
            'dias_laborales', array['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
        ),
        'workflows', jsonb_build_object(
            'leads_activos', true,
            'encuestas_activas', true,
            'reclamos_activos', true,
            'notificaciones_activas', true
        )
    ) as configuracion
FROM concesionarios 
WHERE estado = 'activo'
ON CONFLICT (concesionario_id) DO NOTHING;

-- =====================================================
-- INSERTAR INTEGRACIONES BÁSICAS
-- =====================================================

-- Integración N8N para cada concesionario
INSERT INTO integraciones (concesionario_id, tipo_integracion, nombre, configuracion, estado)
SELECT 
    id as concesionario_id,
    'n8n' as tipo_integracion,
    'N8N OptimaCX' as nombre,
    jsonb_build_object(
        'base_url', 'https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app',
        'webhook_prefix', 'webhook/' || LOWER(REPLACE(nombre, ' ', '_')),
        'api_enabled', true,
        'version', '1.0.0'
    ) as configuracion,
    'activo' as estado
FROM concesionarios 
WHERE estado = 'activo'
ON CONFLICT (concesionario_id, tipo_integracion, nombre) DO NOTHING;

-- Integración Gemini IA para cada concesionario
INSERT INTO integraciones (concesionario_id, tipo_integracion, nombre, configuracion, estado)
SELECT 
    id as concesionario_id,
    'gemini' as tipo_integracion,
    'Gemini IA Assistant' as nombre,
    jsonb_build_object(
        'model', 'gemini-2.5-pro',
        'embedding_model', 'gemini-embedding-001',
        'max_tokens', 1000,
        'temperature', 0.1,
        'safety_settings', jsonb_build_object(
            'block_harassment', true,
            'block_hate_speech', true
        ),
        'custom_prompts', jsonb_build_object(
            'lead_analysis', 'Analiza este mensaje de WhatsApp para extraer información del cliente interesado en vehículos.',
            'complaint_classification', 'Clasifica este reclamo automotriz según categoría, urgencia y sentimiento.'
        )
    ) as configuracion,
    'activo' as estado
FROM concesionarios 
WHERE estado = 'activo'
ON CONFLICT (concesionario_id, tipo_integracion, nombre) DO NOTHING;

-- =====================================================
-- INSERTAR TEMPLATES DE COMUNICACIÓN BÁSICOS
-- =====================================================

-- Template de bienvenida por WhatsApp
INSERT INTO templates_comunicacion (concesionario_id, nombre, tipo, categoria, contenido, variables, es_predeterminado)
SELECT 
    id as concesionario_id,
    'Bienvenida Lead WhatsApp' as nombre,
    'whatsapp' as tipo,
    'bienvenida' as categoria,
    'Hola {nombre}! 👋 Gracias por contactarnos desde {concesionario}. Hemos recibido tu consulta sobre {vehiculo} y un asesor especializado te contactará pronto. ¿Hay algo específico que te gustaría saber?' as contenido,
    '{"variables": ["{nombre}", "{concesionario}", "{vehiculo}", "{asesor}"]}' as variables,
    true as es_predeterminado
FROM concesionarios 
WHERE estado = 'activo'
ON CONFLICT (concesionario_id, categoria, tipo, es_predeterminado) DO NOTHING;

-- Template de seguimiento de lead por email
INSERT INTO templates_comunicacion (concesionario_id, nombre, tipo, categoria, asunto, contenido, variables)
SELECT 
    id as concesionario_id,
    'Seguimiento Lead Email' as nombre,
    'email' as tipo,
    'seguimiento' as categoria,
    'Nuevo Lead Asignado - {nombre}' as asunto,
    'Estimado/a {asesor},

Se te ha asignado un nuevo lead:

👤 Cliente: {nombre}
📱 Teléfono: {telefono}
🚗 Interés: {vehiculo}
⭐ Score: {score}/100
📊 Nivel: {nivel_interes}

Mensaje original:
"{mensaje_original}"

Por favor contacta al cliente dentro de las próximas 2 horas.

Saludos,
Sistema OptimaCX' as contenido,
    '{"variables": ["{asesor}", "{nombre}", "{telefono}", "{vehiculo}", "{score}", "{nivel_interes}", "{mensaje_original}"]}' as variables
FROM concesionarios 
WHERE estado = 'activo';

-- Template de encuesta post-venta por WhatsApp
INSERT INTO templates_comunicacion (concesionario_id, nombre, tipo, categoria, contenido, variables)
SELECT 
    id as concesionario_id,
    'Encuesta Post-Venta WhatsApp' as nombre,
    'whatsapp' as tipo,
    'encuesta' as categoria,
    'Hola {nombre}! En {concesionario} valoramos tu opinión. ¿Podrías calificar del 1 al 10 tu experiencia de servicio? Tu feedback nos ayuda a mejorar. 🚗✨

Responde con un número del 1 al 10.' as contenido,
    '{"variables": ["{nombre}", "{concesionario}", "{vehiculo}", "{vin}", "{fecha_servicio}"]}' as variables
FROM concesionarios 
WHERE estado = 'activo';

-- Template de notificación de reclamo
INSERT INTO templates_comunicacion (concesionario_id, nombre, tipo, categoria, asunto, contenido, variables)
SELECT 
    id as concesionario_id,
    'Notificación Reclamo' as nombre,
    'email' as tipo,
    'reclamo' as categoria,
    'RECLAMO #{numero_reclamo} - {categoria} - {cliente}' as asunto,
    'Se ha recibido un nuevo reclamo:

📋 Número: #{numero_reclamo}
👤 Cliente: {cliente}
🚗 Vehículo: {vehiculo} ({vin})
🏢 Sucursal: {sucursal}
⚠️ Urgencia: {urgencia}
📂 Categoría: {categoria}

Descripción:
{descripcion}

{black_alert_notice}

Asignado a: {asesor_asignado}

Favor gestionar según protocolo.

Sistema OptimaCX' as contenido,
    '{"variables": ["{numero_reclamo}", "{cliente}", "{vehiculo}", "{vin}", "{sucursal}", "{urgencia}", "{categoria}", "{descripcion}", "{asesor_asignado}", "{black_alert_notice}"]}' as variables
FROM concesionarios 
WHERE estado = 'activo';

-- =====================================================
-- INSERTAR NOTIFICACIÓN DE SISTEMA
-- =====================================================

-- Notificación de bienvenida al sistema para cada concesionario
INSERT INTO notificaciones (concesionario_id, tipo_notificacion, titulo, contenido, estado, canal_envio, referencia_tipo)
SELECT 
    id as concesionario_id,
    'internal' as tipo_notificacion,
    'Sistema OptimaCX Configurado' as titulo,
    'Las tablas críticas han sido configuradas correctamente. Los workflows de N8N ahora pueden conectarse a Supabase. Configuración multitenant habilitada.' as contenido,
    'enviado' as estado,
    'system' as canal_envio,
    'configuracion' as referencia_tipo
FROM concesionarios 
WHERE estado = 'activo';

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

-- Mostrar resumen de configuraciones creadas
DO $$ 
DECLARE 
    config_count INTEGER;
    integration_count INTEGER;
    template_count INTEGER;
    notification_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO config_count FROM configuraciones_concesionario;
    SELECT COUNT(*) INTO integration_count FROM integraciones;
    SELECT COUNT(*) INTO template_count FROM templates_comunicacion;
    SELECT COUNT(*) INTO notification_count FROM notificaciones;
    
    RAISE NOTICE 'Datos iniciales creados exitosamente:';
    RAISE NOTICE '- Configuraciones: % concesionarios', config_count;
    RAISE NOTICE '- Integraciones: % registros', integration_count;
    RAISE NOTICE '- Templates: % plantillas', template_count;
    RAISE NOTICE '- Notificaciones: % mensajes', notification_count;
END $$;
