-- =====================================================
-- Optima-Complaints - Datos de Ejemplo
-- Seed data SOLO para módulo de Reclamos
-- Versión: 2.1.0
-- Fecha: 2025-10-28
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CONCESIONARIOS (Multitenant)
-- =====================================================

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
);


-- =====================================================
-- 2. SUCURSALES
-- =====================================================

INSERT INTO public.sucursales (id, concesionario_id, nombre, codigo, direccion, ciudad, telefono, horario_atencion) VALUES
-- Toyota Central
('b1f2e3d4-c5b6-a798-5432-000000000001', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Sucursal Principal', 'PRINCIPAL', 'Av. Libertador Bernardo O''Higgins 1234', 'Santiago', '+56224567890', '{"lunes_viernes": "08:00-19:00", "sabado": "09:00-14:00"}'),
('b1f2e3d4-c5b6-a798-5432-000000000002', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Sucursal Maipú', 'MAIPU', 'Av. Pajaritos 3456', 'Maipú', '+56225678901', '{"lunes_viernes": "08:30-18:30", "sabado": "09:00-13:00"}'),

-- Nissan Las Condes
('b1f2e3d4-c5b6-a798-5432-000000000003', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'Servicio Técnico', 'SERVICIO', 'Av. Las Condes 1234', 'Las Condes', '+56223456790', '{"lunes_viernes": "08:00-17:00", "sabado": "08:00-12:00"}');


-- =====================================================
-- 3. USUARIOS (Solo roles de reclamos)
-- =====================================================

INSERT INTO public.usuarios (id, concesionario_id, sucursal_id, nombre_completo, rut, email, telefono, role) VALUES
-- Super Admin
('c2g3h4i5-d6e7-f8a9-6543-000000000001', 'a0e1d2c3-b4a5-9687-4321-000000000001', NULL, 'Admin Sistema', '12.345.678-9', 'admin@optimacomplaints.com', '+56911111111', 'super_admin'),

-- Toyota Central - Equipo de Reclamos
('c2g3h4i5-d6e7-f8a9-6543-000000000002', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'Carlos Mendoza', '13.456.789-0', 'cmendoza@toyotacentral.cl', '+56922222222', 'jefe_servicio'),
('c2g3h4i5-d6e7-f8a9-6543-000000000003', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'María González', '14.567.890-1', 'mgonzalez@toyotacentral.cl', '+56933333333', 'asesor_servicio'),
('c2g3h4i5-d6e7-f8a9-6543-000000000004', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000002', 'Pedro Ramírez', '15.678.901-2', 'pramirez@toyotacentral.cl', '+56944444444', 'asesor_servicio'),
('c2g3h4i5-d6e7-f8a9-6543-000000000005', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'Ana Flores', '16.789.012-3', 'aflores@toyotacentral.cl', '+56955555555', 'encargado_calidad'),
('c2g3h4i5-d6e7-f8a9-6543-000000000006', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'b1f2e3d4-c5b6-a798-5432-000000000001', 'Luis Torres', '17.890.123-4', 'ltorres@toyotacentral.cl', '+56966666666', 'contact_center'),

-- Nissan Las Condes - Equipo de Reclamos
('c2g3h4i5-d6e7-f8a9-6543-000000000007', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'b1f2e3d4-c5b6-a798-5432-000000000003', 'Roberto Silva', '18.901.234-5', 'rsilva@nissancondes.cl', '+56977777777', 'jefe_servicio'),
('c2g3h4i5-d6e7-f8a9-6543-000000000008', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'b1f2e3d4-c5b6-a798-5432-000000000003', 'Carmen Vega', '19.012.345-6', 'cvega@nissancondes.cl', '+56988888888', 'asesor_servicio');


-- =====================================================
-- 4. CLIENTES
-- =====================================================

INSERT INTO public.clientes (id, concesionario_id, nombre, rut, telefono, email, direccion) VALUES
('d3h4i5j6-e7f8-g9h0-7654-000000000001', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Juan Pérez López', '20.123.456-7', '+56912345678', 'juan.perez@email.com', 'Los Leones 123, Providencia'),
('d3h4i5j6-e7f8-g9h0-7654-000000000002', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'María Rodríguez', '21.234.567-8', '+56923456789', 'maria.rodriguez@email.com', 'Apoquindo 456, Las Condes'),
('d3h4i5j6-e7f8-g9h0-7654-000000000003', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'Carlos Soto', '22.345.678-9', '+56934567890', 'carlos.soto@email.com', 'Vitacura 789, Vitacura'),
('d3h4i5j6-e7f8-g9h0-7654-000000000004', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Patricia Muñoz', '23.456.789-0', '+56945678901', 'patricia.munoz@email.com', 'Alameda 321, Santiago Centro');


-- =====================================================
-- 5. VEHÍCULOS
-- =====================================================

INSERT INTO public.vehiculos (id, concesionario_id, vin, patente, marca, modelo, anio, cliente_id) VALUES
('e4i5j6k7-f8g9-h0i1-8765-000000000001', 'a0e1d2c3-b4a5-9687-4321-000000000001', '1HGBH41JXMN109186', 'BBCD12', 'Toyota', 'Corolla', 2023, 'd3h4i5j6-e7f8-g9h0-7654-000000000001'),
('e4i5j6k7-f8g9-h0i1-8765-000000000002', 'a0e1d2c3-b4a5-9687-4321-000000000001', '2HGBH41JXMN109187', 'CCDE23', 'Toyota', 'RAV4', 2024, 'd3h4i5j6-e7f8-g9h0-7654-000000000002'),
('e4i5j6k7-f8g9-h0i1-8765-000000000003', 'a0e1d2c3-b4a5-9687-4321-000000000002', '3HGBH41JXMN109188', 'DDEF34', 'Nissan', 'Sentra', 2023, 'd3h4i5j6-e7f8-g9h0-7654-000000000003'),
('e4i5j6k7-f8g9-h0i1-8765-000000000004', 'a0e1d2c3-b4a5-9687-4321-000000000001', '4HGBH41JXMN109189', 'EEFG45', 'Toyota', 'Hilux', 2022, 'd3h4i5j6-e7f8-g9h0-7654-000000000004');


-- =====================================================
-- 6. CATEGORÍAS DE RECLAMOS
-- =====================================================

INSERT INTO public.categorias_reclamo (id, concesionario_id, nombre, descripcion, color, tiempo_resolucion_estimado, nivel_prioridad) VALUES
-- Toyota Central
('f5j6k7l8-g9h0-i1j2-9876-000000000001', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Falla Mecánica', 'Problemas relacionados con motor, transmisión o sistemas mecánicos', '#ef4444', 48, 'alta'),
('f5j6k7l8-g9h0-i1j2-9876-000000000002', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Garantía', 'Reclamos relacionados con cobertura de garantía', '#f59e0b', 72, 'media'),
('f5j6k7l8-g9h0-i1j2-9876-000000000003', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Atención al Cliente', 'Quejas sobre servicio o atención recibida', '#3b82f6', 24, 'media'),
('f5j6k7l8-g9h0-i1j2-9876-000000000004', 'a0e1d2c3-b4a5-9687-4321-000000000001', 'Repuestos', 'Problemas con repuestos o disponibilidad', '#8b5cf6', 96, 'baja'),

-- Nissan Las Condes
('f5j6k7l8-g9h0-i1j2-9876-000000000005', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'Falla Eléctrica', 'Problemas con sistema eléctrico del vehículo', '#ef4444', 48, 'alta'),
('f5j6k7l8-g9h0-i1j2-9876-000000000006', 'a0e1d2c3-b4a5-9687-4321-000000000002', 'Garantía', 'Reclamos de garantía', '#f59e0b', 72, 'media');


-- =====================================================
-- 7. RECLAMOS (Ejemplos)
-- =====================================================

INSERT INTO public.reclamos (
    id,
    concesionario_id,
    sucursal_id,
    cliente_id,
    vehiculo_id,
    numero_reclamo,
    categoria_id,
    cliente_nombre,
    cliente_email,
    cliente_telefono,
    titulo,
    descripcion,
    estado,
    prioridad,
    urgencia,
    canal_ingreso,
    asignado_a_user_id,
    es_black_alert,
    clasificacion_ia,
    sentimiento_analisis
) VALUES
-- Reclamo 1: Falla mecánica normal
(
    'g6k7l8m9-h0i1-j2k3-0987-000000000001',
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'b1f2e3d4-c5b6-a798-5432-000000000001',
    'd3h4i5j6-e7f8-g9h0-7654-000000000001',
    'e4i5j6k7-f8g9-h0i1-8765-000000000001',
    'REC-2025-001',
    'f5j6k7l8-g9h0-i1j2-9876-000000000001',
    'Juan Pérez López',
    'juan.perez@email.com',
    '+56912345678',
    'Ruido extraño en el motor al arrancar',
    'Mi vehículo hace un ruido extraño al encender en las mañanas. El sonido persiste por unos segundos y luego desaparece.',
    'asignado',
    'media',
    'normal',
    'contact_center',
    'c2g3h4i5-d6e7-f8a9-6543-000000000003',
    false,
    '{"tipo_reclamo": "garantia", "categoria": "motor", "urgencia_detectada": "media", "confianza": 0.89}',
    '{"sentimiento": "neutral", "score": 0.15, "emociones": ["preocupación"], "tono": "formal"}'
),

-- Reclamo 2: Black Alert (compra reciente con falla grave)
(
    'g6k7l8m9-h0i1-j2k3-0987-000000000002',
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'b1f2e3d4-c5b6-a798-5432-000000000002',
    'd3h4i5j6-e7f8-g9h0-7654-000000000002',
    'e4i5j6k7-f8g9-h0i1-8765-000000000002',
    'REC-2025-002',
    'f5j6k7l8-g9h0-i1j2-9876-000000000001',
    'María Rodríguez',
    'maria.rodriguez@email.com',
    '+56923456789',
    'Vehículo nuevo se apaga en movimiento - PELIGRO',
    'Compré el vehículo hace 3 meses y se ha apagado en plena carretera 3 veces. Esto es inaceptable y peligroso. Exijo solución inmediata o devolución del dinero.',
    'nuevo',
    'critica',
    'alta',
    'email',
    NULL,
    true,
    '{"tipo_reclamo": "garantia", "categoria": "motor", "urgencia_detectada": "alta", "confianza": 0.95, "es_black_alert": true}',
    '{"sentimiento": "negativo", "score": -0.75, "emociones": ["frustración", "enojo", "preocupación"], "tono": "agresivo"}'
),

-- Reclamo 3: Atención al cliente
(
    'g6k7l8m9-h0i1-j2k3-0987-000000000003',
    'a0e1d2c3-b4a5-9687-4321-000000000002',
    'b1f2e3d4-c5b6-a798-5432-000000000003',
    'd3h4i5j6-e7f8-g9h0-7654-000000000003',
    'e4i5j6k7-f8g9-h0i1-8765-000000000003',
    'REC-2025-003',
    'f5j6k7l8-g9h0-i1j2-9876-000000000005',
    'Carlos Soto',
    'carlos.soto@email.com',
    '+56934567890',
    'Demora excesiva en reparación',
    'Dejé mi vehículo hace 2 semanas para una reparación simple y aún no está listo. Nadie me da información clara.',
    'en_proceso',
    'media',
    'normal',
    'web',
    'c2g3h4i5-d6e7-f8a9-6543-000000000008',
    false,
    '{"tipo_reclamo": "servicio", "categoria": "atencion_cliente", "urgencia_detectada": "media", "confianza": 0.82}',
    '{"sentimiento": "negativo", "score": -0.45, "emociones": ["frustración", "decepción"], "tono": "formal"}'
);


-- =====================================================
-- 8. SEGUIMIENTOS DE RECLAMOS
-- =====================================================

INSERT INTO public.seguimientos_reclamo (
    id,
    reclamo_id,
    user_id,
    tipo_seguimiento,
    descripcion,
    estado_anterior,
    estado_nuevo
) VALUES
(
    'h7l8m9n0-i1j2-k3l4-1098-000000000001',
    'g6k7l8m9-h0i1-j2k3-0987-000000000001',
    'c2g3h4i5-d6e7-f8a9-6543-000000000003',
    'cambio_estado',
    'Reclamo asignado para revisión',
    'nuevo',
    'asignado'
),
(
    'h7l8m9n0-i1j2-k3l4-1098-000000000002',
    'g6k7l8m9-h0i1-j2k3-0987-000000000003',
    'c2g3h4i5-d6e7-f8a9-6543-000000000008',
    'cambio_estado',
    'Iniciando proceso de reparación',
    'asignado',
    'en_proceso'
);


-- =====================================================
-- 9. KNOWLEDGE BASE (Base de conocimiento para RAG)
-- =====================================================

INSERT INTO public.knowledge_base (
    id,
    concesionario_id,
    titulo,
    contenido,
    categoria,
    tags,
    activo
) VALUES
(
    'i8m9n0o1-j2k3-l4m5-2109-000000000001',
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'Política de Garantía - Motor',
    'La garantía de motor cubre defectos de fabricación por 3 años o 100,000 km, lo que ocurra primero. Incluye: motor, transmisión, sistema de frenos y dirección. No cubre: mantenimiento regular, piezas de desgaste, daños por accidente.',
    'garantia',
    ARRAY['motor', 'garantia', 'cobertura'],
    true
),
(
    'i8m9n0o1-j2k3-l4m5-2109-000000000002',
    'a0e1d2c3-b4a5-9687-4321-000000000001',
    'Procedimiento Black Alert',
    'Cuando un vehículo presenta fallas graves dentro de los 6 meses de compra: 1) Contactar al cliente en menos de 4 horas, 2) Inspección técnica urgente, 3) Ofrecer vehículo de reemplazo, 4) Resolver en máximo 48 horas.',
    'procedimientos',
    ARRAY['black_alert', 'urgente', 'protocolo'],
    true
),
(
    'i8m9n0o1-j2k3-l4m5-2109-000000000003',
    'a0e1d2c3-b4a5-9687-4321-000000000002',
    'Tiempos de Reparación Estándar',
    'Reparaciones menores: 2-3 días. Reparaciones con repuestos: 5-7 días. Reparaciones complejas: 10-15 días. Cliente debe ser notificado si hay demoras.',
    'servicio',
    ARRAY['tiempos', 'reparacion', 'sla'],
    true
);

COMMIT;

-- =====================================================
-- FIN DE SEED DATA
-- =====================================================
