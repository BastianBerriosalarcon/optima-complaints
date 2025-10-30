-- Setup Admin User para bastianberrios.a@gmail.com
-- Este script crea/actualiza el perfil del usuario y lo asocia a un concesionario

-- 1. Verificar que el usuario existe en auth.users
DO $$
DECLARE
    user_id_var UUID;
    concesionario_id_var TEXT;
BEGIN
    -- Obtener el ID del usuario
    SELECT id INTO user_id_var
    FROM auth.users
    WHERE email = 'bastianberrios.a@gmail.com';

    IF user_id_var IS NULL THEN
        RAISE EXCEPTION 'Usuario con email bastianberrios.a@gmail.com no encontrado. Por favor créalo primero desde el dashboard de Supabase.';
    END IF;

    RAISE NOTICE 'Usuario encontrado: %', user_id_var;

    -- 2. Obtener o crear un concesionario de prueba
    SELECT id INTO concesionario_id_var
    FROM concesionarios
    WHERE estado = 'activo'
    LIMIT 1;

    IF concesionario_id_var IS NULL THEN
        -- Crear concesionario de prueba si no existe ninguno
        INSERT INTO concesionarios (nombre, rut, direccion, telefono, email, estado)
        VALUES (
            'Concesionario Demo',
            '12345678-9',
            'Santiago, Chile',
            '+56912345678',
            'demo@optimacx.com',
            'activo'
        )
        RETURNING id INTO concesionario_id_var;

        RAISE NOTICE 'Concesionario Demo creado: %', concesionario_id_var;
    ELSE
        RAISE NOTICE 'Concesionario existente: %', concesionario_id_var;
    END IF;

    -- 3. Insertar o actualizar usuario administrador
    INSERT INTO usuarios (
        auth_user_id,
        concesionario_id,
        email,
        nombre_completo,
        role,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        user_id_var,
        concesionario_id_var,
        'bastianberrios.a@gmail.com',
        'Bastian Berrios',
        'admin_concesionario',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (concesionario_id, email)
    DO UPDATE SET
        auth_user_id = EXCLUDED.auth_user_id,
        nombre_completo = EXCLUDED.nombre_completo,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();

    RAISE NOTICE 'Usuario administrador creado/actualizado exitosamente';

    -- 4. Crear sucursal si no existe
    IF NOT EXISTS (SELECT 1 FROM sucursales WHERE concesionario_id = concesionario_id_var) THEN
        INSERT INTO sucursales (concesionario_id, nombre, direccion, telefono, email, estado)
        VALUES (
            concesionario_id_var,
            'Sucursal Principal',
            'Santiago, Chile',
            '+56912345678',
            'sucursal@optimacx.com',
            'activo'
        );
        RAISE NOTICE 'Sucursal Principal creada';
    END IF;

    RAISE NOTICE '✅ Setup completado exitosamente';
    RAISE NOTICE 'Usuario: bastianberrios.a@gmail.com';
    RAISE NOTICE 'Rol: admin_concesionario';
    RAISE NOTICE 'Concesionario ID: %', concesionario_id_var;

END $$;

-- Verificar que todo esté correcto
SELECT
    u.email,
    usr.nombre_completo,
    usr.role,
    usr.is_active,
    c.nombre as concesionario
FROM auth.users u
JOIN usuarios usr ON u.id = usr.auth_user_id
JOIN concesionarios c ON usr.concesionario_id = c.id
WHERE u.email = 'bastianberrios.a@gmail.com';
