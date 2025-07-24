-- Complete schema for Óptima-CX Platform
-- This migration creates all required tables for N8N workflows

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Table: concesionarios (dealerships)
CREATE TABLE IF NOT EXISTS public.concesionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: sucursales (branches)
CREATE TABLE IF NOT EXISTS public.sucursales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(concesionario_id, codigo)
);

-- Table: usuarios (users)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID UNIQUE REFERENCES auth.users(id),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    sucursal_id UUID REFERENCES public.sucursales(id),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'super_admin', 'gerencia', 'jefe_servicio', 'asesor_servicio', 
        'contact_center', 'encargado_calidad', 'responsable_contact_center',
        'asesor_ventas'
    )),
    carga_actual INTEGER DEFAULT 0, -- Required for advisor workload
    especialidad TEXT, -- Required for advisor specialization
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: clientes (customers)
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    nombre VARCHAR(255) NOT NULL,
    rut VARCHAR(12) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: vehiculos (vehicles)
CREATE TABLE IF NOT EXISTS public.vehiculos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    vin VARCHAR(17) UNIQUE NOT NULL,
    patente VARCHAR(10),
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anio INTEGER,
    cliente_id UUID REFERENCES public.clientes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: leads (sales leads)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    telefono_cliente VARCHAR(20) NOT NULL,
    nombre_cliente VARCHAR(255),
    email_cliente VARCHAR(255),
    intencion_detectada VARCHAR(50) CHECK (intencion_detectada IN ('compra', 'informacion', 'servicio', 'cotizacion')),
    modelo_interes VARCHAR(200),
    mensaje_original TEXT NOT NULL,
    score_calidad INTEGER CHECK (score_calidad >= 1 AND score_calidad <= 100),
    nivel_interes VARCHAR(10) CHECK (nivel_interes IN ('alto', 'medio', 'bajo')),
    asesor_asignado_id UUID REFERENCES public.usuarios(id),
    estado VARCHAR(20) DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'cotizado', 'vendido', 'perdido')),
    fecha_primer_contacto TIMESTAMP WITH TIME ZONE,
    fecha_cotizacion TIMESTAMP WITH TIME ZONE,
    monto_cotizacion DECIMAL(12,2),
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    motivo_perdida TEXT,
    fuente_lead VARCHAR(20) DEFAULT 'whatsapp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(concesionario_id, telefono_cliente)
);

-- Table: encuestas (surveys)
CREATE TABLE IF NOT EXISTS public.encuestas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    sucursal_id UUID REFERENCES public.sucursales(id),
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_rut VARCHAR(12),
    cliente_telefono VARCHAR(20) NOT NULL,
    recomendacion INTEGER CHECK (recomendacion >= 1 AND recomendacion <= 10),
    satisfaccion INTEGER CHECK (satisfaccion >= 1 AND satisfaccion <= 10),
    lavado INTEGER CHECK (lavado >= 1 AND lavado <= 10),
    asesor INTEGER CHECK (asesor >= 1 AND asesor <= 10),
    comentario TEXT,
    average_score DECIMAL(3,2), -- Required for calculated average
    origen VARCHAR(20) CHECK (origen IN ('QR', 'WhatsApp', 'Llamada')), -- Required for survey source
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado')),
    contact_center_user_id UUID REFERENCES public.usuarios(id),
    fecha_servicio DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(concesionario_id, cliente_telefono, fecha_servicio)
);

-- Table: talleres (workshops)
CREATE TABLE IF NOT EXISTS public.talleres (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    sucursal_id UUID NOT NULL REFERENCES public.sucursales(id),
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(concesionario_id, codigo)
);

-- Table: reclamos (complaints)
CREATE TABLE IF NOT EXISTS public.reclamos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id),
    vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id),
    vin VARCHAR(17) NOT NULL,
    sucursal_id UUID NOT NULL REFERENCES public.sucursales(id),
    taller_id UUID NOT NULL REFERENCES public.talleres(id),
    id_externo VARCHAR(100) NOT NULL,
    detalle TEXT NOT NULL,
    black_alert BOOLEAN DEFAULT FALSE,
    tipo_reclamo VARCHAR(20) DEFAULT 'Externo' CHECK (tipo_reclamo IN ('Externo', 'Interno')),
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Cerrado')),
    urgencia VARCHAR(10) CHECK (urgencia IN ('alta', 'media', 'baja')),
    clasificacion_ia TEXT,
    sugerencias_resolucion JSONB,
    referencias_politicas JSONB,
    canal_origen VARCHAR(20) CHECK (canal_origen IN ('whatsapp', 'email', 'web')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(concesionario_id, id_externo)
);

-- Table: documentos_conocimiento (knowledge base documents for RAG)
CREATE TABLE IF NOT EXISTS public.documentos_conocimiento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    titulo VARCHAR(500) NOT NULL,
    contenido_original TEXT NOT NULL,
    categoria VARCHAR(100),
    tags TEXT[],
    autor VARCHAR(255),
    version VARCHAR(50) DEFAULT '1.0',
    idioma VARCHAR(10) DEFAULT 'es',
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'procesando')),
    metadatos JSONB,
    chunks_generados INTEGER DEFAULT 0,
    fecha_procesado TIMESTAMP WITH TIME ZONE,
    archivo_original VARCHAR(500),
    tipo_documento VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: documento_chunks (RAG document chunks with embeddings)
CREATE TABLE IF NOT EXISTS public.documento_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    documento_id UUID NOT NULL REFERENCES public.documentos_conocimiento(id) ON DELETE CASCADE,
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id),
    chunk_index INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    embedding vector(768), -- Using 768 dimensions for gemini-embedding-001
    token_count INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(documento_id, chunk_index)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usuarios_concesionario_role ON public.usuarios(concesionario_id, role);
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON public.usuarios(auth_id);
CREATE INDEX IF NOT EXISTS idx_leads_concesionario_estado ON public.leads(concesionario_id, estado);
CREATE INDEX IF NOT EXISTS idx_leads_asesor_asignado ON public.leads(asesor_asignado_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_concesionario_origen ON public.encuestas(concesionario_id, origen);
CREATE INDEX IF NOT EXISTS idx_encuestas_contact_center_user ON public.encuestas(contact_center_user_id);
CREATE INDEX IF NOT EXISTS idx_reclamos_concesionario_estado ON public.reclamos(concesionario_id, estado);
CREATE INDEX IF NOT EXISTS idx_documentos_concesionario_estado ON public.documentos_conocimiento(concesionario_id, estado);
CREATE INDEX IF NOT EXISTS idx_chunks_documento ON public.documento_chunks(documento_id);

-- Create vector similarity search index for RAG
CREATE INDEX IF NOT EXISTS idx_documento_chunks_embedding 
ON public.documento_chunks USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Enable Row Level Security on all tables
ALTER TABLE public.concesionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reclamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_conocimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant isolation
-- Concesionarios: Super admin can see all, others only their own
CREATE POLICY "Concesionarios policy" ON public.concesionarios FOR ALL 
USING (
    CASE 
        WHEN auth.jwt() ->> 'role' = 'super_admin' THEN true
        ELSE id::text = auth.jwt() ->> 'concesionario_id'
    END
);

-- Sucursales: Tenant isolated
CREATE POLICY "Sucursales are tenant isolated" ON public.sucursales FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Usuarios: Tenant isolated  
CREATE POLICY "Usuarios are tenant isolated" ON public.usuarios FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Vehiculos: Tenant isolated
CREATE POLICY "Vehiculos are tenant isolated" ON public.vehiculos FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Clientes: Tenant isolated
CREATE POLICY "Clientes are tenant isolated" ON public.clientes FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Leads: Tenant isolated
CREATE POLICY "Leads are tenant isolated" ON public.leads FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Encuestas: Tenant isolated
CREATE POLICY "Encuestas are tenant isolated" ON public.encuestas FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Talleres: Tenant isolated
CREATE POLICY "Talleres are tenant isolated" ON public.talleres FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Reclamos: Tenant isolated
CREATE POLICY "Reclamos are tenant isolated" ON public.reclamos FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Documentos conocimiento: Tenant isolated
CREATE POLICY "Documentos conocimiento are tenant isolated" ON public.documentos_conocimiento FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Documento chunks: Tenant isolated
CREATE POLICY "Documento chunks are tenant isolated" ON public.documento_chunks FOR ALL
USING (concesionario_id::text = auth.jwt() ->> 'concesionario_id');

-- Functions for survey score calculation
CREATE OR REPLACE FUNCTION calculate_survey_average()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate average only when survey is completed
    IF NEW.estado = 'completado' AND (
        NEW.recomendacion IS NOT NULL AND 
        NEW.satisfaccion IS NOT NULL AND 
        NEW.lavado IS NOT NULL AND 
        NEW.asesor IS NOT NULL
    ) THEN
        NEW.average_score = (NEW.recomendacion + NEW.satisfaccion + NEW.lavado + NEW.asesor) / 4.0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate survey average
CREATE TRIGGER trigger_calculate_survey_average
    BEFORE INSERT OR UPDATE ON public.encuestas
    FOR EACH ROW
    EXECUTE FUNCTION calculate_survey_average();

-- Function to search knowledge base with RAG (cosine similarity)
CREATE OR REPLACE FUNCTION search_knowledge_base(
    p_concesionario_id UUID,
    p_query_embedding vector(768),
    p_limit INTEGER DEFAULT 5,
    p_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    documento_id UUID,
    chunk_id UUID,
    contenido TEXT,
    similarity FLOAT,
    metadata JSONB,
    documento_titulo VARCHAR,
    documento_categoria VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.documento_id,
        dc.id as chunk_id,
        dc.contenido,
        (1 - (dc.embedding <=> p_query_embedding)) as similarity,
        dc.metadata,
        doc.titulo as documento_titulo,
        doc.categoria as documento_categoria
    FROM public.documento_chunks dc
    JOIN public.documentos_conocimiento doc ON dc.documento_id = doc.id
    WHERE 
        dc.concesionario_id = p_concesionario_id
        AND doc.estado = 'activo'
        AND (1 - (dc.embedding <=> p_query_embedding)) >= p_threshold
    ORDER BY dc.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION search_knowledge_base(UUID, vector, INTEGER, FLOAT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_survey_average() TO authenticated;

-- Insert sample data for testing
INSERT INTO public.concesionarios (id, nombre, codigo) VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Concesionario Demo', 'DEMO01')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.sucursales (concesionario_id, nombre, codigo) VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Sucursal Principal', 'PRIN01')
ON CONFLICT (concesionario_id, codigo) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.concesionarios IS 'Dealership/tenant table for multi-tenant isolation';
COMMENT ON TABLE public.usuarios IS 'Users table with role-based access and advisor workload tracking';
COMMENT ON TABLE public.leads IS 'Sales leads from WhatsApp with AI analysis and advisor assignment';
COMMENT ON TABLE public.encuestas IS 'Customer satisfaction surveys with multi-channel support (QR/WhatsApp/Call)';
COMMENT ON TABLE public.reclamos IS 'Customer complaints with AI processing and RAG context';
COMMENT ON TABLE public.documentos_conocimiento IS 'Knowledge base documents for RAG system';
COMMENT ON TABLE public.documento_chunks IS 'Document chunks with embeddings for vector similarity search';
COMMENT ON FUNCTION search_knowledge_base IS 'Vector similarity search function for RAG knowledge retrieval';