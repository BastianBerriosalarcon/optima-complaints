-- =====================================================
-- OptimaCx Unificado - Esquema Completo
-- Ventas + Post-Venta + RAG + Multitenant
-- =====================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- CORE MULTITENANT TABLES
-- =====================================================

-- Tabla de concesionarios (tenants)
CREATE TABLE IF NOT EXISTS public.concesionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    rut VARCHAR(20) UNIQUE,
    region VARCHAR(100),
    ciudad VARCHAR(100),
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Configuración de marca
    logo_url TEXT,
    brand_config JSONB DEFAULT '{}',
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    plan VARCHAR(50) DEFAULT 'basic', -- basic, premium, enterprise
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sucursales
CREATE TABLE IF NOT EXISTS public.sucursales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    direccion TEXT,
    ciudad VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(255),
    
    -- Ubicación
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    
    -- Configuración
    horario_atencion JSONB DEFAULT '{}',
    servicios_disponibles JSONB DEFAULT '[]', -- ['ventas', 'servicio', 'repuestos']
    activa BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id, codigo)
);

-- Tabla de usuarios con roles específicos
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    
    -- Datos personales
    nombre_completo VARCHAR(255) NOT NULL,
    rut VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    
    -- Rol específico por área
    role VARCHAR(50) NOT NULL DEFAULT 'asesor_ventas' 
        CHECK (role IN (
            'super_admin',
            'admin_concesionario', 
            'gerente_ventas',
            'asesor_ventas',
            'jefe_servicio', 
            'asesor_servicio', 
            'contact_center', 
            'encargado_calidad',
            'marketing'
        )),
    
    -- Configuración específica del usuario
    comision_ventas DECIMAL(5,2), -- % de comisión
    meta_mensual DECIMAL(10,2), -- meta de ventas/encuestas
    areas_responsabilidad JSONB DEFAULT '[]', -- ['ventas', 'post_venta']
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id, rut),
    UNIQUE(concesionario_id, email)
);

-- =====================================================
-- MÓDULO DE VENTAS
-- =====================================================

-- Tabla de leads (potenciales clientes)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    asesor_asignado_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    
    -- Datos del lead
    nombre_completo VARCHAR(255) NOT NULL,
    rut VARCHAR(20),
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    -- Información demográfica
    edad INTEGER,
    genero VARCHAR(10) CHECK (genero IN ('masculino', 'femenino', 'otro')),
    ciudad VARCHAR(100),
    comuna VARCHAR(100),
    
    -- Origen del lead
    canal_origen VARCHAR(30) NOT NULL DEFAULT 'whatsapp' 
        CHECK (canal_origen IN ('whatsapp', 'web', 'facebook', 'instagram', 'referido', 'llamada', 'presencial')),
    fuente_detalle TEXT, -- URL específica, campaña, etc.
    
    -- Interés y preferencias
    tipo_vehiculo_interes VARCHAR(50), -- 'sedan', 'suv', 'pickup', 'hatchback'
    marca_interes VARCHAR(50),
    modelo_interes VARCHAR(100),
    presupuesto_min DECIMAL(10,2),
    presupuesto_max DECIMAL(10,2),
    
    -- Estado del lead
    estado VARCHAR(20) DEFAULT 'nuevo' 
        CHECK (estado IN ('nuevo', 'contactado', 'calificado', 'cotizado', 'negociando', 'vendido', 'perdido')),
    
    -- Scoring automático (calculado por IA)
    score_calidad INTEGER CHECK (score_calidad >= 0 AND score_calidad <= 100),
    probabilidad_compra DECIMAL(3,2), -- 0.00 a 1.00
    
    -- Seguimiento
    proximo_contacto TIMESTAMP WITH TIME ZONE,
    notas TEXT,
    
    -- Metadatos
    ip_origen INET,
    user_agent TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos/vehículos
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Información básica
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    version VARCHAR(100),
    año INTEGER NOT NULL,
    
    -- Características técnicas
    tipo_vehiculo VARCHAR(50), -- 'sedan', 'suv', 'pickup', 'hatchback'
    combustible VARCHAR(30), -- 'gasolina', 'diesel', 'hibrido', 'electrico'
    transmision VARCHAR(30), -- 'manual', 'automatica', 'cvt'
    traccion VARCHAR(20), -- '4x2', '4x4'
    motor VARCHAR(100),
    potencia VARCHAR(50),
    
    -- Precios y disponibilidad
    precio_base DECIMAL(12,2) NOT NULL,
    precio_oferta DECIMAL(12,2),
    stock_disponible INTEGER DEFAULT 0,
    
    -- Configuración de ventas
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    orden_display INTEGER DEFAULT 1,
    
    -- Contenido multimedia
    imagen_principal TEXT,
    galeria_imagenes JSONB DEFAULT '[]',
    ficha_tecnica_url TEXT,
    
    -- Metadatos para RAG
    descripcion_ventas TEXT, -- Descripción optimizada para IA de ventas
    keywords JSONB DEFAULT '[]', -- Keywords para matching
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id, marca, modelo, version, año)
);

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS public.cotizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_cotizacion VARCHAR(50) UNIQUE NOT NULL, -- COT-2024-001
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    
    -- Relaciones
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    producto_id UUID REFERENCES public.productos(id) ON DELETE RESTRICT,
    asesor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    
    -- Datos del cliente (snapshot al momento de cotizar)
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_rut VARCHAR(20),
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(255),
    
    -- Configuración del vehículo cotizado
    vehiculo_configuracion JSONB DEFAULT '{}', -- Opciones, accesorios, etc.
    
    -- Precios detallados
    precio_vehiculo DECIMAL(12,2) NOT NULL,
    descuentos JSONB DEFAULT '[]', -- [{tipo: 'promocional', monto: 500000, descripcion: '...'}]
    extras JSONB DEFAULT '[]', -- Accesorios, seguros, etc.
    precio_total DECIMAL(12,2) NOT NULL,
    
    -- Financiamiento
    financiamiento JSONB DEFAULT '{}', -- {pie: 2000000, cuotas: 48, valor_cuota: 850000}
    
    -- Estado y seguimiento
    estado VARCHAR(20) DEFAULT 'enviada' 
        CHECK (estado IN ('borrador', 'enviada', 'vista', 'aceptada', 'negociando', 'vendida', 'vencida', 'rechazada')),
    
    fecha_envio TIMESTAMP WITH TIME ZONE,
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    fecha_vista TIMESTAMP WITH TIME ZONE, -- Cuando el cliente la vio
    fecha_respuesta TIMESTAMP WITH TIME ZONE,
    
    -- Generación automática
    pdf_url TEXT, -- URL del PDF generado
    link_visualizacion TEXT, -- Link único para el cliente
    
    -- Métricas
    veces_vista INTEGER DEFAULT 0,
    tiempo_respuesta_horas INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas (cuando se concreta)
CREATE TABLE IF NOT EXISTS public.ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_venta VARCHAR(50) UNIQUE NOT NULL, -- VEN-2024-001
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    
    -- Relaciones
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE SET NULL,
    producto_id UUID REFERENCES public.productos(id) ON DELETE RESTRICT,
    asesor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    
    -- Datos del cliente final
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_rut VARCHAR(20) NOT NULL,
    cliente_telefono VARCHAR(20),
    cliente_email VARCHAR(255),
    cliente_direccion TEXT,
    
    -- Detalles de la venta
    precio_final DECIMAL(12,2) NOT NULL,
    forma_pago VARCHAR(30) NOT NULL, -- 'contado', 'financiado', 'leasing'
    financiamiento_detalle JSONB DEFAULT '{}',
    
    -- Estado de la venta
    estado VARCHAR(20) DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'confirmada', 'entregada', 'cancelada')),
    
    -- Fechas importantes
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_entrega_estimada DATE,
    fecha_entrega_real TIMESTAMP WITH TIME ZONE,
    
    -- Comisiones
    comision_asesor DECIMAL(10,2),
    comision_gerente DECIMAL(10,2),
    
    -- Documentación
    contrato_url TEXT,
    documentos_adicionales JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MÓDULO POST-VENTA (del esquema anterior)
-- =====================================================

-- Tabla de encuestas (mantenemos del esquema anterior)
CREATE TABLE IF NOT EXISTS public.encuestas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    
    -- Relación con venta (NUEVO - conecta con módulo ventas)
    venta_id UUID REFERENCES public.ventas(id) ON DELETE SET NULL,
    
    -- Datos del cliente
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_rut VARCHAR(20),
    cliente_telefono VARCHAR(20),
    cliente_email VARCHAR(255),
    
    -- Origen de la encuesta
    canal VARCHAR(20) NOT NULL DEFAULT 'qr' 
        CHECK (canal IN ('qr', 'whatsapp', 'llamada', 'manual')),
    
    -- 4 Preguntas principales (escala 1-10)
    recomendacion INTEGER CHECK (recomendacion >= 1 AND recomendacion <= 10),
    satisfaccion INTEGER CHECK (satisfaccion >= 1 AND satisfaccion <= 10),
    lavado INTEGER CHECK (lavado >= 1 AND lavado <= 10),
    asesor INTEGER CHECK (asesor >= 1 AND asesor <= 10),
    
    -- Comentario opcional
    comentario TEXT,
    
    -- Estado y metadatos
    estado VARCHAR(20) DEFAULT 'completado' CHECK (estado IN ('pendiente', 'completado')),
    ip_address INET,
    user_agent TEXT,
    
    fecha_respuesta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reclamos (mantenemos del esquema anterior con mejoras)
CREATE TABLE IF NOT EXISTS public.reclamos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    
    -- Relación con venta (NUEVO)
    venta_id UUID REFERENCES public.ventas(id) ON DELETE SET NULL,
    
    -- Datos del cliente
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_rut VARCHAR(20),
    cliente_telefono VARCHAR(20),
    cliente_email VARCHAR(255),
    
    -- Datos del vehículo
    vehiculo_patente VARCHAR(20),
    vehiculo_vin VARCHAR(50),
    vehiculo_marca VARCHAR(100),
    vehiculo_modelo VARCHAR(100),
    
    -- Datos del reclamo
    id_externo VARCHAR(100), -- Identificador único por concesionario
    detalle TEXT NOT NULL,
    tipo_reclamo VARCHAR(20) DEFAULT 'externo' CHECK (tipo_reclamo IN ('externo', 'interno')),
    
    -- Black Alert (legislación consumidor)
    black_alert BOOLEAN DEFAULT false,
    
    -- Clasificación IA (mejorada)
    clasificacion_ia JSONB DEFAULT '{}',
    urgencia VARCHAR(10) DEFAULT 'media' CHECK (urgencia IN ('baja', 'media', 'alta')),
    categoria_detectada VARCHAR(100), -- Detectada por IA
    
    -- Estado del reclamo
    estado VARCHAR(20) DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'en_proceso', 'cerrado')),
    
    -- Asignación
    asesor_asignado_id UUID REFERENCES public.usuarios(id),
    jefe_servicio_asignado_id UUID REFERENCES public.usuarios(id),
    
    -- Canal de origen
    canal_origen VARCHAR(20) DEFAULT 'manual' 
        CHECK (canal_origen IN ('whatsapp', 'email', 'web', 'manual', 'telefono')),
    
    -- Timestamps
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id, id_externo)
);

-- =====================================================
-- SISTEMA RAG UNIFICADO (del esquema anterior mejorado)
-- =====================================================

-- Incluimos las tablas RAG del archivo anterior pero mejoradas
-- [Se incluye todo el contenido del rag-unified-schema.sql anterior]

-- Tabla de documentos con contexto unificado
CREATE TABLE IF NOT EXISTS public.documentos_conocimiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_documento VARCHAR(50) NOT NULL,
    
    -- Contexto UNIFICADO
    contexto VARCHAR(20) NOT NULL CHECK (contexto IN ('ventas', 'post_venta', 'compartido')),
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    
    tags JSONB DEFAULT '[]',
    
    archivo_url TEXT,
    archivo_nombre VARCHAR(255),
    tipo_archivo VARCHAR(10),
    contenido_texto TEXT,
    resumen_ia TEXT,
    
    version VARCHAR(20) DEFAULT '1.0',
    activo BOOLEAN DEFAULT true,
    
    total_consultas INTEGER DEFAULT 0,
    ultima_consulta TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id, titulo, version)
);

-- Chunks con embeddings contextualizados
CREATE TABLE IF NOT EXISTS public.documento_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    documento_id UUID REFERENCES public.documentos_conocimiento(id) ON DELETE CASCADE,
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    chunk_index INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    
    contexto VARCHAR(20) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    
    embedding vector(1536), -- text-embedding-004
    
    metadata JSONB DEFAULT '{}',
    peso_busqueda DECIMAL(3,2) DEFAULT 1.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONFIGURACIÓN Y INTEGRACIÓN N8N
-- =====================================================

-- Configuración extendida para ventas + post-venta
CREATE TABLE IF NOT EXISTS public.tenant_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Configuración WhatsApp
    whatsapp_token TEXT,
    whatsapp_phone_number_id TEXT,
    whatsapp_verify_token TEXT,
    whatsapp_business_account_id TEXT,
    
    -- Configuración Email SMTP
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_user VARCHAR(255),
    smtp_password TEXT,
    smtp_from_email VARCHAR(255),
    
    -- Configuración IA
    ai_provider VARCHAR(50) DEFAULT 'gemini',
    ai_api_key TEXT,
    ai_model VARCHAR(100) DEFAULT 'gemini-2.0-flash-exp',
    
    -- Prompts específicos por módulo
    prompts_ventas JSONB DEFAULT '{}',
    prompts_post_venta JSONB DEFAULT '{}',
    
    -- Configuración RAG
    rag_enabled BOOLEAN DEFAULT true,
    rag_config JSONB DEFAULT '{}',
    
    -- Configuración de automatizaciones de ventas
    auto_respuesta_leads BOOLEAN DEFAULT true,
    auto_seguimiento_cotizaciones BOOLEAN DEFAULT true,
    auto_scoring_leads BOOLEAN DEFAULT true,
    
    -- Configuración de automatizaciones post-venta
    auto_envio_encuestas BOOLEAN DEFAULT true,
    auto_escalacion_reclamos BOOLEAN DEFAULT true,
    auto_clasificacion_reclamos BOOLEAN DEFAULT true,
    
    -- Webhooks para n8n
    webhook_lead_nuevo TEXT,
    webhook_cotizacion_enviada TEXT,
    webhook_venta_realizada TEXT,
    webhook_encuesta_qr TEXT,
    webhook_reclamo_nuevo TEXT,
    
    -- Configuración de marca
    brand_config JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id)
);

-- =====================================================
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para generar números de cotización/venta
CREATE OR REPLACE FUNCTION generar_numero_documento(
    p_tipo VARCHAR(10), -- 'COT' o 'VEN'
    p_concesionario_id UUID
)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_codigo_concesionario VARCHAR(10);
    v_year VARCHAR(4);
    v_contador INTEGER;
    v_numero VARCHAR(50);
BEGIN
    -- Obtener código del concesionario
    SELECT codigo INTO v_codigo_concesionario 
    FROM public.concesionarios 
    WHERE id = p_concesionario_id;
    
    -- Año actual
    v_year := EXTRACT(YEAR FROM NOW())::VARCHAR(4);
    
    -- Obtener siguiente contador
    IF p_tipo = 'COT' THEN
        SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_cotizacion, '-', 4) AS INTEGER)), 0) + 1
        INTO v_contador
        FROM public.cotizaciones 
        WHERE concesionario_id = p_concesionario_id 
        AND numero_cotizacion LIKE 'COT-' || v_codigo_concesionario || '-' || v_year || '-%';
    ELSE
        SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_venta, '-', 4) AS INTEGER)), 0) + 1
        INTO v_contador
        FROM public.ventas 
        WHERE concesionario_id = p_concesionario_id 
        AND numero_venta LIKE 'VEN-' || v_codigo_concesionario || '-' || v_year || '-%';
    END IF;
    
    -- Construir número
    v_numero := p_tipo || '-' || v_codigo_concesionario || '-' || v_year || '-' || LPAD(v_contador::VARCHAR, 4, '0');
    
    RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar score de lead automáticamente
CREATE OR REPLACE FUNCTION calcular_score_lead(p_lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_lead RECORD;
BEGIN
    SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;
    
    -- Scoring basado en datos del lead
    IF v_lead.email IS NOT NULL THEN v_score := v_score + 10; END IF;
    IF v_lead.presupuesto_max > 10000000 THEN v_score := v_score + 20; END IF;
    IF v_lead.modelo_interes IS NOT NULL THEN v_score := v_score + 15; END IF;
    IF v_lead.canal_origen = 'referido' THEN v_score := v_score + 25; END IF;
    IF v_lead.canal_origen = 'presencial' THEN v_score := v_score + 20; END IF;
    
    -- Actualizar score
    UPDATE public.leads 
    SET score_calidad = v_score,
        probabilidad_compra = LEAST(v_score / 100.0, 1.0)
    WHERE id = p_lead_id;
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Función para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers para updated_at en todas las tablas principales
CREATE TRIGGER update_concesionarios_updated_at 
    BEFORE UPDATE ON public.concesionarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sucursales_updated_at 
    BEFORE UPDATE ON public.sucursales 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON public.usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON public.leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at 
    BEFORE UPDATE ON public.productos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cotizaciones_updated_at 
    BEFORE UPDATE ON public.cotizaciones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at 
    BEFORE UPDATE ON public.ventas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encuestas_updated_at 
    BEFORE UPDATE ON public.encuestas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reclamos_updated_at 
    BEFORE UPDATE ON public.reclamos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_leads_concesionario_estado 
ON public.leads (concesionario_id, estado);

CREATE INDEX IF NOT EXISTS idx_leads_asesor_estado 
ON public.leads (asesor_asignado_id, estado) WHERE asesor_asignado_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cotizaciones_concesionario_estado 
ON public.cotizaciones (concesionario_id, estado);

CREATE INDEX IF NOT EXISTS idx_ventas_concesionario_fecha 
ON public.ventas (concesionario_id, fecha_venta);

CREATE INDEX IF NOT EXISTS idx_encuestas_concesionario_canal 
ON public.encuestas (concesionario_id, canal);

CREATE INDEX IF NOT EXISTS idx_reclamos_concesionario_estado 
ON public.reclamos (concesionario_id, estado);

-- Índices para RAG
CREATE INDEX IF NOT EXISTS documento_chunks_embedding_idx 
ON public.documento_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS documento_chunks_tenant_contexto_idx 
ON public.documento_chunks (concesionario_id, contexto, categoria);