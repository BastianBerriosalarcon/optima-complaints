-- Configuración inicial de tenant para pruebas
-- Ejecutar en Supabase SQL Editor

-- 1. Crear concesionario de prueba
INSERT INTO concesionarios (
    id,
    nombre,
    telefono,
    email,
    direccion,
    configuracion_ai,
    configuracion_whatsapp,
    activo,
    created_at
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'Concesionario OptimaTest',
    '+56912345678',
    'test@optimacx.com',
    'Av. Providencia 1234, Santiago',
    '{
        "modelo": "gemini-pro",
        "temperatura": 0.3,
        "max_tokens": 2000,
        "prompt_base": "Eres un asistente especializado en análisis de leads automotrices."
    }'::jsonb,
    '{
        "numero_comercial": "+56912345678",
        "webhook_verificado": true,
        "horario_atencion": {
            "lunes_viernes": "09:00-18:00",
            "sabado": "09:00-14:00",
            "domingo": "cerrado"
        }
    }'::jsonb,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    configuracion_ai = EXCLUDED.configuracion_ai,
    configuracion_whatsapp = EXCLUDED.configuracion_whatsapp,
    updated_at = NOW();

-- 2. Crear usuarios de prueba
INSERT INTO usuarios (
    id,
    email,
    nombre,
    apellido,
    rol,
    concesionario_id,
    activo,
    metadatos,
    created_at
) VALUES 
-- Gerente de ventas
(
    'b2c3d4e5-f6g7-8901-bcde-f12345678901'::uuid,
    'gerente@optimatest.com',
    'Carlos',
    'Gerente',
    'gerente_ventas',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    true,
    '{
        "especialidades": ["ventas", "gestion_equipo"],
        "capacidad_maxima_leads": 50,
        "experiencia_años": 8
    }'::jsonb,
    NOW()
),
-- Jefe de ventas
(
    'c3d4e5f6-g7h8-9012-cdef-123456789012'::uuid,
    'jefe@optimatest.com',
    'Ana',
    'Jefe',
    'jefe_ventas',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    true,
    '{
        "especialidades": ["ventas", "supervision"],
        "capacidad_maxima_leads": 30,
        "experiencia_años": 5
    }'::jsonb,
    NOW()
),
-- Asesor de ventas 1
(
    'd4e5f6g7-h8i9-0123-defa-234567890123'::uuid,
    'asesor1@optimatest.com',
    'Pedro',
    'Asesor',
    'asesor_ventas',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    true,
    '{
        "especialidades": ["autos_nuevos", "financiamiento"],
        "capacidad_maxima_leads": 15,
        "experiencia_años": 3
    }'::jsonb,
    NOW()
),
-- Asesor de ventas 2
(
    'e5f6g7h8-i9j0-1234-efab-345678901234'::uuid,
    'asesor2@optimatest.com',
    'Laura',
    'Asesora',
    'asesor_ventas',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    true,
    '{
        "especialidades": ["autos_usados", "trade_in"],
        "capacidad_maxima_leads": 15,
        "experiencia_años": 2
    }'::jsonb,
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    metadatos = EXCLUDED.metadatos,
    updated_at = NOW();

-- 3. Configurar cargas de trabajo iniciales
INSERT INTO cargas_trabajo (
    usuario_id,
    concesionario_id,
    leads_activos,
    leads_completados,
    capacidad_actual,
    capacidad_maxima,
    eficiencia_promedio,
    activo,
    created_at
) VALUES 
-- Gerente
(
    'b2c3d4e5-f6g7-8901-bcde-f12345678901'::uuid,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    0, 0, 0, 50, 95.0, true, NOW()
),
-- Jefe
(
    'c3d4e5f6-g7h8-9012-cdef-123456789012'::uuid,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    0, 0, 0, 30, 90.0, true, NOW()
),
-- Asesor 1
(
    'd4e5f6g7-h8i9-0123-defa-234567890123'::uuid,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    0, 0, 0, 15, 85.0, true, NOW()
),
-- Asesor 2
(
    'e5f6g7h8-i9j0-1234-efab-345678901234'::uuid,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    0, 0, 0, 15, 88.0, true, NOW()
)
ON CONFLICT (usuario_id) DO UPDATE SET
    capacidad_maxima = EXCLUDED.capacidad_maxima,
    eficiencia_promedio = EXCLUDED.eficiencia_promedio,
    updated_at = NOW();

-- 4. Verificar configuración
SELECT 
    c.nombre as concesionario,
    u.nombre || ' ' || u.apellido as usuario,
    u.rol,
    ct.capacidad_maxima,
    ct.eficiencia_promedio
FROM concesionarios c
JOIN usuarios u ON c.id = u.concesionario_id
LEFT JOIN cargas_trabajo ct ON u.id = ct.usuario_id
WHERE c.id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid
ORDER BY 
    CASE u.rol 
        WHEN 'gerente_ventas' THEN 1
        WHEN 'jefe_ventas' THEN 2
        WHEN 'asesor_ventas' THEN 3
        ELSE 4
    END;
