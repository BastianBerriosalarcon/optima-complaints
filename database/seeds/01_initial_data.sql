-- =====================================================
-- OptimaCx Unificado - Datos de Ejemplo
-- Seed data para Ventas + Post-Venta + RAG
-- =====================================================

-- Insertar concesionarios con configuración completa
INSERT INTO public.concesionarios (id, nombre, codigo, rut, region, ciudad, email, logo_url, brand_config, plan) VALUES
(
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'Toyota Central Santiago',
    'TOYOTA_CENTRAL',
    '76.123.456-7',
    'Metropolitana',
    'Santiago',
    'admin@toyotacentral.cl',
    'https://example.com/toyota-logo.png',
    '{
        "primary_color": "#eb0a1e",
        "secondary_color": "#000000",
        "company_name": "Toyota Central Santiago",
        "welcome_message": "¡Gracias por elegir Toyota Central! Tu satisfacción es nuestra prioridad.",
        "business_hours": {"start": "08:00", "end": "19:00"},
        "timezone": "America/Santiago"
    }',
    'premium'
),
(
    'a0e1d2c3-b4a5-9687-4321-000000000002',
    'Nissan Las Condes',
    'NISSAN_CONDES',
    '76.234.567-8',
    'Metropolitana',
    'Las Condes',
    'admin@nissancondes.cl',
    'https://example.com/nissan-logo.png',
    '{
        "primary_color": "#c3002f",
        "secondary_color": "#000000",
        "company_name": "Nissan Las Condes",
        "welcome_message": "Bienvenido a Nissan Las Condes, donde la innovación nos mueve.",
        "business_hours": {"start": "09:00", "end": "18:00"},
        "timezone": "America/Santiago"
    }',
    'basic'
),
(
    'a0e1d2c3-b4a5-9687-4321-000000000003',
    'Chevrolet Valparaíso',
    'CHEVROLET_VALPO',
    '76.345.678-9',
    'Valparaíso',
    'Valparaíso',
    'admin@chevroletvalpo.cl',
    'https://example.com/chevrolet-logo.png',
    '{
        "primary_color": "#ffc72c",
        "secondary_color": "#000000",
        "company_name": "Chevrolet Valparaíso",
        "welcome_message": "Chevrolet Valparaíso te da la bienvenida. Juntos encontramos el camino.",
        "business_hours": {"start": "08:30", "end": "18:30"},
        "timezone": "America/Santiago"
    }',
    'premium'
);

-- Insertar sucursales con servicios específicos
INSERT INTO public.sucursales (id, concesionario_id, nombre, codigo, direccion, ciudad, telefono, servicios_disponibles, horario_atencion) VALUES
-- Toyota Central
('b1f2e3d4-c5b6-a798-5432-000000000001', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Sucursal Principal', 'PRINCIPAL', 'Av. Libertador Bernardo O''Higgins 1234', 'Santiago', '+56224567890', '["ventas", "servicio", "repuestos"]', '{"lunes_viernes": "08:00-19:00", "sabado": "09:00-14:00", "domingo": "cerrado"}'),
('b1f2e3d4-c5b6-a798-5432-000000000002', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Sucursal Maipú', 'MAIPU', 'Av. Pajaritos 3456', 'Maipú', '+56225678901', '["ventas", "servicio"]', '{"lunes_viernes": "08:30-18:30", "sabado": "09:00-13:00", "domingo": "cerrado"}'),

-- Nissan Las Condes
('b1f2e3d4-c5b6-a798-5432-000000000003', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'Showroom Las Condes', 'SHOWROOM', 'Av. Apoquindo 7890', 'Las Condes', '+56223456789', '["ventas"]', '{"lunes_viernes": "09:00-18:00", "sabado": "10:00-14:00", "domingo": "cerrado"}'),
('b1f2e3d4-c5b6-a798-5432-000000000004', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'Servicio Técnico', 'SERVICIO', 'Av. Las Condes 1234', 'Las Condes', '+56223456790', '["servicio", "repuestos"]', '{"lunes_viernes": "08:00-17:00", "sabado": "08:00-12:00", "domingo": "cerrado"}'),

-- Chevrolet Valparaíso
('b1f2e3d4-c5b6-a798-5432-000000000005', 'a0e1d2c3-b4a5-9687-4321-000000000003', 'Casa Matriz', 'MATRIZ', 'Av. Brasil 567', 'Valparaíso', '+56322345678', '["ventas", "servicio", "repuestos"]', '{"lunes_viernes": "08:30-18:30", "sabado": "09:00-13:00", "domingo": "cerrado"}');

-- Insertar usuarios con roles específicos de ventas y post-venta
INSERT INTO public.usuarios (id, concesionario_id, sucursal_id, nombre_completo, rut, email, telefono, role, comision_ventas, meta_mensual, areas_responsabilidad) VALUES
-- Toyota Central - Equipo completo
('c2g3f4e5-d6c7-b8a9-6543-000000000001', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'Carlos Rodríguez Silva', '12345678-9', 'carlos.rodriguez@toyotacentral.cl', '+56987654321', 'admin_concesionario', NULL, NULL, '["ventas", "post_venta"]'),
('c2g3f4e5-d6c7-b8a9-6543-000000000002', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'María González López', '23456789-0', 'maria.gonzalez@toyotacentral.cl', '+56987654322', 'gerente_ventas', 1.5, 15000000.00, '["ventas"]'),
('c2g3f4e5-d6c7-b8a9-6543-000000000003', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'Pedro Martínez Ruiz', '34567890-1', 'pedro.martinez@toyotacentral.cl', '+56987654323', 'asesor_ventas', 3.0, 8000000.00, '["ventas"]'),
('c2g3f4e5-d6c7-b8a9-6543-000000000004', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'Ana Fernández Torres', '45678901-2', 'ana.fernandez@toyotacentral.cl', '+56987654324', 'asesor_ventas', 3.0, 8000000.00, '["ventas"]'),
('c2g3f4e5-d6c7-b8a9-6543-000000000005', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'Luis Herrera Castro', '56789012-3', 'luis.herrera@toyotacentral.cl', '+56987654325', 'jefe_servicio', NULL, NULL, '["post_venta"]'),
('c2g3f4e5-d6c7-b8a9-6543-000000000006', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'Carmen Morales Vega', '67890123-4', 'carmen.morales@toyotacentral.cl', '+56987654326', 'asesor_servicio', NULL, NULL, '["post_venta"]'),
('c2g3f4e5-d6c7-b8a9-6543-000000000007', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'Roberto Sánchez Díaz', '78901234-5', 'roberto.sanchez@toyotacentral.cl', '+56987654327', 'contact_center', NULL, 150.00, '["post_venta"]'),
('c2g3f4e5-d6c7-b8a9-6543-000000000008', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'Patricia López Rojas', '89012345-6', 'patricia.lopez@toyotacentral.cl', '+56987654328', 'encargado_calidad', NULL, NULL, '["post_venta"]'),

-- Nissan Las Condes - Equipo enfocado en ventas premium
('c2g3f4e5-d6c7-b8a9-6543-000000000009', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'b1f2e3d4-c5b6-a798-5432-000000000003', 'Francisco Jiménez Mendoza', '90123456-7', 'francisco.jimenez@nissancondes.cl', '+56987654329', 'admin_concesionario', NULL, NULL, '["ventas", "post_venta"]'),
('c2g3f4e5-d6c7-b8a9-6543-000000000010', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'b1f2e3d4-c5b6-a798-5432-000000000003', 'Daniela Ramos Flores', '01234567-8', 'daniela.ramos@nissancondes.cl', '+56987654330', 'gerente_ventas', 2.0, 20000000.00, '["ventas"]'),
('c2g3f4e5-d6c7-b8a9-6543-000000000011', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'b1f2e3d4-c5b6-a798-5432-000000000003', 'Mauricio López Gallardo', '11234567-9', 'mauricio.lopez@nissancondes.cl', '+56987654331', 'asesor_ventas', 3.5, 12000000.00, '["ventas"]'),

-- Chevrolet Valparaíso - Equipo mixto
('c2g3f4e5-d6c7-b8a9-6543-000000000012', 'a0e1d2c3-b4a5-9687-4321-000000000003', 'b1f2e3d4-c5b6-a798-5432-000000000005', 'Andrea Silva Castro', '21234567-0', 'andrea.silva@chevroletvalpo.cl', '+56987654332', 'admin_concesionario', NULL, NULL, '["ventas", "post_venta"]'),
('c2g3f4e5-d6c7-b8a9-6543-000000000013', 'a0e1d2c3-b4a5-9687-4321-000000000003', 'b1f2e3d4-c5b6-a798-5432-000000000005', 'Gabriel Moreno Torres', '31234567-1', 'gabriel.moreno@chevroletvalpo.cl', '+56987654333', 'asesor_ventas', 2.8, 6000000.00, '["ventas"]');

-- Insertar productos/vehículos por concesionario
INSERT INTO public.productos (id, concesionario_id, marca, modelo, version, año, tipo_vehiculo, combustible, transmision, precio_base, precio_oferta, stock_disponible, activo, destacado, descripcion_ventas, keywords) VALUES
-- Toyota Central
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Toyota', 'Corolla', 'XEI CVT', 2024, 'sedan', 'gasolina', 'cvt', 16990000.00, 15990000.00, 5, true, true, 'El sedán más vendido de Chile. Ideal para familias que buscan confiabilidad, eficiencia y tecnología. Incluye Toyota Safety Sense 2.0.', '["sedan", "familiar", "economico", "confiable", "toyota"]'),
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Toyota', 'RAV4', 'XLE AWD', 2024, 'suv', 'gasolina', 'cvt', 28990000.00, 27990000.00, 3, true, true, 'SUV mediano con tracción integral. Perfecto para aventuras familiares con la máxima seguridad y comodidad.', '["suv", "4x4", "familiar", "aventura", "seguro"]'),
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Toyota', 'Prius', 'Hybrid', 2024, 'hatchback', 'hibrido', 'cvt', 23990000.00, NULL, 2, true, false, 'El híbrido más eficiente. Reduce tu huella de carbono sin sacrificar comodidad ni tecnología.', '["hibrido", "ecologico", "eficiente", "tecnologia"]'),

-- Nissan Las Condes
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000002', 'Nissan', 'Sentra', 'Advance CVT', 2024, 'sedan', 'gasolina', 'cvt', 15490000.00, 14490000.00, 4, true, true, 'Sedán premium con diseño deportivo. Tecnología Nissan Intelligent Mobility para una experiencia de manejo superior.', '["sedan", "deportivo", "premium", "tecnologia"]'),
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000002', 'Nissan', 'X-Trail', 'Exclusive AWD', 2024, 'suv', 'gasolina', 'cvt', 32990000.00, 31990000.00, 2, true, true, 'SUV de 7 asientos con tecnología ProPILOT. Lujo y versatilidad para familias exigentes.', '["suv", "7_asientos", "lujo", "tecnologia", "piloto_automatico"]'),

-- Chevrolet Valparaíso
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000003', 'Chevrolet', 'Onix', 'LTZ', 2024, 'hatchback', 'gasolina', 'manual', 11990000.00, 10990000.00, 8, true, true, 'Hatchback urbano ideal para jóvenes. Diseño moderno, tecnología OnStar y excelente rendimiento de combustible.', '["hatchback", "urbano", "jovenes", "economico", "onstar"]'),
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000003', 'Chevrolet', 'Tracker', 'Premier AWD', 2024, 'suv', 'gasolina', 'automatica', 19990000.00, 18990000.00, 6, true, true, 'SUV compacto con personalidad aventurera. Tracción integral y tecnología para conquistar cualquier camino.', '["suv", "compacto", "aventura", "4x4", "tecnologia"]');

-- Insertar leads de ejemplo con diferentes estados
INSERT INTO public.leads (id, concesionario_id, sucursal_id, asesor_asignado_id, nombre_completo, rut, telefono, email, edad, canal_origen, tipo_vehiculo_interes, marca_interes, modelo_interes, presupuesto_min, presupuesto_max, estado, score_calidad, probabilidad_compra, proximo_contacto, notas, utm_source, utm_campaign) VALUES
-- Toyota Central - Leads en diferentes estados
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'c2g3f4e5-d6c7-b8a9-6543-000000000003', 'Juan Carlos Pérez', '16789123-4', '+56987123001', 'juan.perez@email.com', 35, 'whatsapp', 'sedan', 'Toyota', 'Corolla', 15000000.00, 18000000.00, 'cotizado', 85, 0.85, NOW() + INTERVAL '2 days', 'Cliente muy interesado, espera respuesta de financiamiento', 'whatsapp_business', 'corolla_2024'),
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'c2g3f4e5-d6c7-b8a9-6543-000000000004', 'María Josefa Silva', '17123456-8', '+56987123002', 'maria.silva@empresa.cl', 28, 'web', 'suv', 'Toyota', 'RAV4', 25000000.00, 30000000.00, 'calificado', 92, 0.92, NOW() + INTERVAL '1 day', 'Ejecutiva, necesita SUV para viajes familiares', 'google_ads', 'rav4_familiar'),
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'c2g3f4e5-d6c7-b8a9-6543-000000000003', 'Carlos Eduardo López', '15987654-2', '+56987123003', 'carlos.lopez@gmail.com', 42, 'referido', 'hatchback', 'Toyota', 'Prius', 20000000.00, 25000000.00, 'negociando', 78, 0.78, NOW() + INTERVAL '3 days', 'Interesado en híbridos por tema ecológico', 'referido', 'prius_eco'),

-- Nissan Las Condes - Leads premium
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000002', 'b1f2e3d4-c5b6-a798-5432-000000000003', 'c2g3f4e5-d6c7-b8a9-6543-000000000011', 'Roberto Francisco Mendoza', '14567890-1', '+56987123004', 'roberto.mendoza@empresa.cl', 38, 'web', 'suv', 'Nissan', 'X-Trail', 30000000.00, 35000000.00, 'contactado', 88, 0.88, NOW() + INTERVAL '1 day', 'CEO de empresa, busca SUV ejecutivo con 7 asientos', 'linkedin_ads', 'xtrail_ejecutivo'),

-- Chevrolet Valparaíso - Leads variados
(uuid_generate_v4(), 'a0e1d2c3-b4a5-9687-4321-000000000003', 'b1f2e3d4-c5b6-a798-5432-000000000005', 'c2g3f4e5-d6c7-b8a9-6543-000000000013', 'Andrea Paola Ramos', '18234567-9', '+56987123005', 'andrea.ramos@universidad.cl', 24, 'instagram', 'hatchback', 'Chevrolet', 'Onix', 10000000.00, 13000000.00, 'nuevo', 65, 0.65, NOW() + INTERVAL '1 day', 'Estudiante universitaria, primer auto', 'instagram_ads', 'onix_jovenes');

-- Insertar cotizaciones basadas en los leads
INSERT INTO public.cotizaciones (id, numero_cotizacion, concesionario_id, sucursal_id, lead_id, producto_id, asesor_id, cliente_nombre, cliente_rut, cliente_telefono, cliente_email, precio_vehiculo, descuentos, precio_total, estado, fecha_envio, fecha_vencimiento) VALUES
(
    uuid_generate_v4(),
    'COT-TOYOTA_CENTRAL-2024-0001',
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'b1f2e3d4-c5b6-a798-5432-000000000001',
    (SELECT id FROM public.leads WHERE telefono = '+56987123001'),
    (SELECT id FROM public.productos WHERE marca = 'Toyota' AND modelo = 'Corolla'),
    'c2g3f4e5-d6c7-b8a9-6543-000000000003',
    'Juan Carlos Pérez',
    '16789123-4',
    '+56987123001',
    'juan.perez@email.com',
    15990000.00,
    '[{"tipo": "descuento_contado", "monto": 500000, "descripcion": "Descuento por pago al contado"}]',
    15490000.00,
    'enviada',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '5 days'
);

-- Insertar una venta realizada
INSERT INTO public.ventas (id, numero_venta, concesionario_id, sucursal_id, lead_id, cotizacion_id, producto_id, asesor_id, cliente_nombre, cliente_rut, cliente_telefono, cliente_email, precio_final, forma_pago, estado, fecha_venta, fecha_entrega_estimada, comision_asesor) VALUES
(
    uuid_generate_v4(),
    'VEN-TOYOTA_CENTRAL-2024-0001',
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'b1f2e3d4-c5b6-a798-5432-000000000001',
    (SELECT id FROM public.leads WHERE telefono = '+56987123002'),
    NULL,
    (SELECT id FROM public.productos WHERE marca = 'Toyota' AND modelo = 'RAV4'),
    'c2g3f4e5-d6c7-b8a9-6543-000000000004',
    'María Josefa Silva',
    '17123456-8',
    '+56987123002',
    'maria.silva@empresa.cl',
    27990000.00,
    'financiado',
    'confirmada',
    NOW() - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '15 days',
    839700.00 -- 3% de comisión
);

-- Insertar configuración de tenants para n8n (completa para ventas + post-venta)
INSERT INTO public.tenant_config (id, concesionario_id, whatsapp_token, whatsapp_phone_number_id, smtp_host, smtp_port, smtp_user, smtp_from_email, ai_provider, ai_model, prompts_ventas, prompts_post_venta, auto_respuesta_leads, auto_seguimiento_cotizaciones, auto_scoring_leads, auto_envio_encuestas, auto_escalacion_reclamos, brand_config) VALUES
-- Toyota Central - Configuración completa
(
    'd3h4g5f6-e7d8-c9ba-7654-000000000001',
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'EAAG...', -- Token de WhatsApp Business
    '123456789012345',
    'smtp.gmail.com',
    587,
    'noreply@toyotacentral.cl',
    'noreply@toyotacentral.cl',
    'gemini',
    'gemini-2.5-pro',
    '{
        "saludo_inicial": "¡Hola! Soy el asistente virtual de Toyota Central. ¿En qué puedo ayudarte hoy?",
        "calificacion_lead": "Analiza este lead y asigna un score del 1-100 basado en: presupuesto, urgencia, datos completos, canal de origen.",
        "recomendacion_vehiculo": "Basándote en el perfil del cliente, recomienda el vehículo Toyota más adecuado de nuestro catálogo.",
        "seguimiento_cotizacion": "Genera un mensaje de seguimiento personalizado para una cotización enviada hace {dias} días."
    }',
    '{
        "clasificacion_reclamo": "Clasifica este reclamo en: técnico, comercial, garantía, black_alert. Asigna urgencia: baja, media, alta.",
        "respuesta_encuesta_baja": "El cliente calificó con nota {nota}. Genera una respuesta empática y propuesta de solución.",
        "escalacion_black_alert": "URGENTE: Caso Black Alert detectado. Notificar inmediatamente a gerencia y equipo legal."
    }',
    true,
    true,
    true,
    true,
    true,
    '{
        "company_name": "Toyota Central Santiago",
        "signature": "Equipo Toyota Central",
        "primary_color": "#eb0a1e",
        "welcome_message": "¡Gracias por elegir Toyota Central!"
    }'
),

-- Nissan Las Condes - Configuración premium
(
    'd3h4g5f6-e7d8-c9ba-7654-000000000002',
    'a0e1d2c3-b4a5-9687-4321-000000000002',
    'EAAB...',
    '234567890123456',
    'smtp.outlook.com',
    587,
    'noreply@nissancondes.cl',
    'noreply@nissancondes.cl',
    'gemini',
    'gemini-2.5-pro',
    '{
        "saludo_inicial": "Bienvenido a Nissan Las Condes. Somos especialistas en vehículos premium. ¿Cómo podemos ayudarte?",
        "calificacion_lead": "Evalúa este lead premium considerando: poder adquisitivo, perfil ejecutivo, urgencia de compra.",
        "recomendacion_vehiculo": "Recomienda vehículos Nissan premium enfocándote en tecnología, lujo y prestaciones superiores."
    }',
    '{
        "clasificacion_reclamo": "Clasifica con estándares premium. Prioriza experiencia del cliente y resolución inmediata.",
        "respuesta_encuesta_baja": "Cliente premium insatisfecho. Activar protocolo de retención y compensación inmediata."
    }',
    true,
    true,
    true,
    true,
    true,
    '{
        "company_name": "Nissan Las Condes",
        "signature": "Equipo Nissan Las Condes",
        "primary_color": "#c3002f",
        "welcome_message": "Nissan Las Condes - Innovación que nos mueve"
    }'
);

-- Insertar documentos de conocimiento para RAG unificado
INSERT INTO public.documentos_conocimiento (id, concesionario_id, titulo, descripcion, tipo_documento, contexto, categoria, subcategoria, tags, contenido_texto, version, activo) VALUES
-- Toyota Central - Documentos de ventas
(
    uuid_generate_v4(),
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'Catálogo Toyota 2024 - Precios y Especificaciones',
    'Catálogo completo con precios y especificaciones técnicas de todos los modelos Toyota 2024',
    'catalogo',
    'ventas',
    'productos',
    'precios',
    '["toyota", "2024", "precios", "especificaciones", "modelos"]',
    'CATÁLOGO TOYOTA 2024
    
    COROLLA XEI CVT 2024
    - Precio: $16.990.000 (Oferta: $15.990.000)
    - Motor: 1.8L VVT-i, 140 HP
    - Transmisión: CVT
    - Combustible: Gasolina
    - Rendimiento: 15.8 km/l ciudad, 20.1 km/l carretera
    - Equipamiento: Toyota Safety Sense 2.0, aire acondicionado automático, pantalla táctil 8", 6 airbags
    - Garantía: 3 años o 60.000 km
    
    RAV4 XLE AWD 2024
    - Precio: $28.990.000 (Oferta: $27.990.000)
    - Motor: 2.0L Dynamic Force, 169 HP
    - Transmisión: CVT
    - Tracción: AWD inteligente
    - Combustible: Gasolina
    - Rendimiento: 13.2 km/l ciudad, 16.8 km/l carretera
    - Equipamiento: Toyota Safety Sense 2.0, climatizador bi-zona, pantalla 9", techo panorámico
    - Capacidad: 5 pasajeros, 580 litros de maletero
    
    PRIUS HYBRID 2024
    - Precio: $23.990.000
    - Motor: Híbrido 1.8L + eléctrico, 122 HP total
    - Transmisión: e-CVT
    - Combustible: Híbrido (gasolina + eléctrico)
    - Rendimiento: 23.8 km/l combinado
    - Equipamiento: Toyota Safety Sense 2.0, sistema híbrido avanzado, pantalla táctil 11.6"
    - Emisiones: Ultra bajo NOx, certificación ambiental',
    '2024.1',
    true
),

-- Toyota Central - Documentos de financiamiento (compartido)
(
    uuid_generate_v4(),
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'Opciones de Financiamiento Toyota',
    'Guía completa de opciones de financiamiento y planes de pago',
    'financiamiento',
    'compartido',
    'financiamiento',
    'planes_pago',
    '["financiamiento", "credito", "planes", "pago", "toyota"]',
    'OPCIONES DE FINANCIAMIENTO TOYOTA CENTRAL
    
    FINANCIAMIENTO DIRECTO TOYOTA
    - Tasa desde 0.69% mensual
    - Plazo: 12 a 84 meses
    - Pie mínimo: 20% del valor del vehículo
    - Aprobación en 24 horas
    - Sin restricción de edad del vehículo para intercambio
    
    PLAN INTELIGENTE
    - Cuota inicial baja
    - Valor futuro garantizado
    - Opción de cambio a los 24 meses
    - Ideal para ejecutivos que renuevan vehículo frecuentemente
    
    LEASING EMPRESARIAL
    - Beneficios tributarios
    - Sin pie mínimo
    - Incluye seguro y mantención
    - Canon desde $450.000 mensuales
    - Opción de compra al final del contrato
    
    REQUISITOS GENERALES
    - Renta mínima: $800.000 líquidos
    - Antigüedad laboral: 12 meses
    - Documentos: cédula de identidad, certificado de renta, libreta de ahorro
    - Evaluación crediticia automática
    
    PROMOCIONES VIGENTES 2024
    - 0% interés primeros 6 meses (Corolla)
    - Bono intercambio hasta $1.500.000 (RAV4)
    - Financiamiento verde 0.5% (Prius Hybrid)',
    '2024.1',
    true
),

-- Toyota Central - Documentos post-venta
(
    uuid_generate_v4(),
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'Manual de Garantías Toyota 2024',
    'Manual completo de coberturas de garantía y procedimientos',
    'manual',
    'post_venta',
    'garantias',
    'cobertura',
    '["garantia", "cobertura", "procedimientos", "toyota", "2024"]',
    'MANUAL DE GARANTÍAS TOYOTA 2024
    
    GARANTÍA DE FÁBRICA
    - Duración: 3 años o 60.000 km (lo que ocurra primero)
    - Cobertura: Motor, transmisión, sistema eléctrico, aire acondicionado
    - Válida en toda la red Toyota Chile
    - Transferible al nuevo propietario
    
    GARANTÍA EXTENDIDA DISPONIBLE
    - Hasta 5 años o 100.000 km
    - Costo: desde $890.000 según modelo
    - Incluye: asistencia en carretera, vehículo de reemplazo
    
    EXCLUSIONES DE GARANTÍA
    - Desgaste normal: neumáticos, pastillas de freno, aceites
    - Daños por mal uso o accidentes
    - Modificaciones no autorizadas
    - Mantenciones fuera de red autorizada
    
    PROCEDIMIENTO DE RECLAMO DE GARANTÍA
    1. Contactar concesionario autorizado dentro de 48 horas
    2. Presentar libreta de mantención al día
    3. Diagnóstico técnico (sin costo si aplica garantía)
    4. Reparación autorizada en máximo 5 días hábiles
    5. Vehículo de reemplazo si reparación supera 3 días
    
    BLACK ALERT - LEY DEL CONSUMIDOR
    - Aplicable si el mismo defecto se repite 3 veces
    - Vehículo con múltiples fallas dentro de 6 meses de compra
    - Opciones: reparación definitiva, cambio de vehículo, devolución
    - Tiempo de resolución: máximo 10 días hábiles
    - Notificación automática a gerencia y equipo legal',
    '2024.1',
    true
),

-- Nissan Las Condes - Documentos de ventas premium
(
    uuid_generate_v4(),
    'a0e1d2c3-b4a5-9687-4321-000000000002',
    'Portfolio Nissan Premium 2024',
    'Catálogo especializado en vehículos Nissan premium y tecnología avanzada',
    'catalogo',
    'ventas',
    'productos',
    'premium',
    '["nissan", "premium", "tecnologia", "lujo", "2024"]',
    'PORTFOLIO NISSAN PREMIUM 2024
    
    SENTRA ADVANCE CVT 2024
    - Precio: $15.490.000 (Oferta: $14.490.000)
    - Motor: 1.6L HR16DE, 118 HP
    - Tecnología: Nissan Intelligent Mobility
    - Transmisión: Xtronic CVT
    - Equipamiento premium: Bose Audio, cuero sintético, cámara 360°
    - Conectividad: Apple CarPlay, Android Auto, NissanConnect
    
    X-TRAIL EXCLUSIVE AWD 2024
    - Precio: $32.990.000 (Oferta: $31.990.000)
    - Motor: 2.5L QR25DE, 171 HP
    - Tecnología: ProPILOT (piloto automático nivel 2)
    - Configuración: 7 asientos premium
    - Tracción: AWD inteligente con 4 modos de manejo
    - Lujo: Asientos de cuero Nappa, climatizador tri-zona, techo panorámico
    - Seguridad: 6 airbags, frenado automático de emergencia, alerta de punto ciego
    
    TECNOLOGÍA NISSAN INTELLIGENT MOBILITY
    - ProPILOT: Control de crucero inteligente con manejo semi-autónomo
    - e-Pedal: Manejo con un solo pedal, frenado regenerativo
    - Alerta de fatiga del conductor
    - Reconocimiento de señales de tránsito
    - Estacionamiento automático (ProPILOT Park)
    
    PROGRAMA VIP NISSAN LAS CONDES
    - Asesor personal dedicado
    - Test drive extendido (48 horas)
    - Entrega personalizada en domicilio
    - Mantención premium con vehículo de cortesía
    - Acceso exclusivo a eventos Nissan',
    '2024.1',
    true
);

-- Insertar algunos chunks de ejemplo para RAG (simulando el procesamiento)
-- Nota: En producción, estos se generarían automáticamente al procesar los documentos
INSERT INTO public.documento_chunks (id, documento_id, concesionario_id, chunk_index, contenido, contexto, categoria, metadata, peso_busqueda) VALUES
(
    uuid_generate_v4(),
    (SELECT id FROM public.documentos_conocimiento WHERE titulo LIKE 'Catálogo Toyota 2024%'),
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    1,
    'COROLLA XEI CVT 2024 - Precio: $16.990.000 (Oferta: $15.990.000) - Motor: 1.8L VVT-i, 140 HP - Transmisión: CVT - Rendimiento: 15.8 km/l ciudad, 20.1 km/l carretera',
    'ventas',
    'productos',
    '{"modelo": "Corolla", "año": 2024, "precio_base": 16990000, "precio_oferta": 15990000, "tipo": "sedan"}',
    1.2
),
(
    uuid_generate_v4(),
    (SELECT id FROM public.documentos_conocimiento WHERE titulo LIKE 'Manual de Garantías%'),
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    1,
    'GARANTÍA DE FÁBRICA - Duración: 3 años o 60.000 km - Cobertura: Motor, transmisión, sistema eléctrico, aire acondicionado - Válida en toda la red Toyota Chile',
    'post_venta',
    'garantias',
    '{"duracion_años": 3, "duracion_km": 60000, "cobertura": ["motor", "transmision", "electrico", "aire_acondicionado"]}',
    1.5
);

-- Insertar algunas encuestas de ejemplo vinculadas a ventas
INSERT INTO public.encuestas (id, concesionario_id, sucursal_id, venta_id, cliente_nombre, cliente_rut, cliente_telefono, canal, recomendacion, satisfaccion, lavado, asesor, comentario) VALUES
(
    uuid_generate_v4(),
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'b1f2e3d4-c5b6-a798-5432-000000000001',
    (SELECT id FROM public.ventas WHERE cliente_rut = '17123456-8'),
    'María Josefa Silva',
    '17123456-8',
    '+56987123002',
    'qr',
    10,
    10,
    9,
    10,
    'Excelente atención desde la cotización hasta la entrega. Ana fue muy profesional y atenta a todos los detalles.'
);

-- Insertar un reclamo de ejemplo
INSERT INTO public.reclamos (id, concesionario_id, sucursal_id, venta_id, cliente_nombre, cliente_rut, cliente_telefono, vehiculo_patente, vehiculo_marca, vehiculo_modelo, id_externo, detalle, tipo_reclamo, urgencia, estado, canal_origen, clasificacion_ia) VALUES
(
    uuid_generate_v4(),
    'a0e1d2c3-b4a5-9687-4321-000000000002',
    'b1f2e3d4-c5b6-a798-5432-000000000003',
    NULL,
    'Roberto Francisco Mendoza',
    '14567890-1',
    '+56987123004',
    'BBCC34',
    'Nissan',
    'Sentra',
    'REC-NIS-2024-001',
    'El vehículo presenta ruidos extraños en el motor al acelerar. Comprado hace 1 mes y ya presenta este problema. Solicito revisión urgente bajo garantía.',
    'externo',
    'media',
    'pendiente',
    'whatsapp',
    '{
        "categoria_detectada": "tecnico",
        "subcategoria": "motor",
        "palabras_clave": ["ruidos", "motor", "acelerar", "garantia"],
        "urgencia_ia": "media",
        "solucion_sugerida": "Revisión técnica inmediata bajo garantía de fábrica"
    }'
);

-- Actualizar scores de leads automáticamente usando la función
SELECT calcular_score_lead(id) FROM public.leads;

-- Actualizar el stock después de la venta
UPDATE public.productos 
SET stock_disponible = stock_disponible - 1 
WHERE id = (SELECT producto_id FROM public.ventas WHERE cliente_rut = '17123456-8');

-- Actualizar el estado del lead que se convirtió en venta
UPDATE public.leads 
SET estado = 'vendido' 
WHERE telefono = '+56987123002';