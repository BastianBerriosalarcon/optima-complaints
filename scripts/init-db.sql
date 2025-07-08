-- OptimaCx Database Initialization Script
-- This script sets up the database for development environment

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create schema for OptimaCx
CREATE SCHEMA IF NOT EXISTS optimacx;

-- Create tenant configuration table
CREATE TABLE IF NOT EXISTS optimacx.tenant_config (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(100) UNIQUE NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    whatsapp_token TEXT,
    whatsapp_phone_id VARCHAR(50),
    smtp_host VARCHAR(255),
    smtp_user VARCHAR(255),
    smtp_password TEXT,
    gemini_api_key TEXT,
    rag_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create encuestas table
CREATE TABLE IF NOT EXISTS optimacx.encuestas (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    sucursal_id VARCHAR(100),
    cliente_nombre VARCHAR(255),
    cliente_rut VARCHAR(20),
    cliente_telefono VARCHAR(20),
    recomendacion INTEGER CHECK (recomendacion >= 1 AND recomendacion <= 10),
    satisfaccion INTEGER CHECK (satisfaccion >= 1 AND satisfaccion <= 10),
    lavado INTEGER CHECK (lavado >= 1 AND lavado <= 10),
    asesor INTEGER CHECK (asesor >= 1 AND asesor <= 10),
    comentario TEXT,
    origen VARCHAR(20) CHECK (origen IN ('QR', 'WhatsApp', 'Llamada')),
    estado VARCHAR(20) DEFAULT 'completado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reclamos table
CREATE TABLE IF NOT EXISTS optimacx.reclamos (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    sucursal_id VARCHAR(100),
    cliente_nombre VARCHAR(255),
    cliente_rut VARCHAR(20),
    vehiculo_patente VARCHAR(20),
    vehiculo_vin VARCHAR(50),
    detalle TEXT NOT NULL,
    tipo_reclamo VARCHAR(50) DEFAULT 'Externo',
    estado VARCHAR(20) DEFAULT 'Pendiente',
    urgencia VARCHAR(20) DEFAULT 'Media',
    black_alert BOOLEAN DEFAULT false,
    rag_classification JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create knowledge base table for RAG
CREATE TABLE IF NOT EXISTS optimacx.knowledge_base (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    document_id VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    content TEXT NOT NULL,
    embedding vector(768), -- Gemini text-embedding-004 dimensions
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_encuestas_tenant_id ON optimacx.encuestas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_origen ON optimacx.encuestas(origen);
CREATE INDEX IF NOT EXISTS idx_encuestas_created_at ON optimacx.encuestas(created_at);

CREATE INDEX IF NOT EXISTS idx_reclamos_tenant_id ON optimacx.reclamos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reclamos_estado ON optimacx.reclamos(estado);
CREATE INDEX IF NOT EXISTS idx_reclamos_urgencia ON optimacx.reclamos(urgencia);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_tenant_id ON optimacx.knowledge_base(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON optimacx.knowledge_base 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Insert demo tenant for testing
INSERT INTO optimacx.tenant_config (tenant_id, tenant_name, rag_enabled)
VALUES ('demo', 'Demo Concesionario', true)
ON CONFLICT (tenant_id) DO NOTHING;

-- Insert sample encuesta
INSERT INTO optimacx.encuestas (
    tenant_id, sucursal_id, cliente_nombre, cliente_rut, cliente_telefono,
    recomendacion, satisfaccion, lavado, asesor, comentario, origen
) VALUES (
    'demo', 'sucursal_001', 'Juan Pérez', '12345678-9', '+56912345678',
    9, 8, 7, 9, 'Muy buen servicio', 'QR'
) ON CONFLICT DO NOTHING;

-- Insert sample reclamo
INSERT INTO optimacx.reclamos (
    tenant_id, sucursal_id, cliente_nombre, cliente_rut, vehiculo_patente,
    vehiculo_vin, detalle, urgencia
) VALUES (
    'demo', 'sucursal_001', 'María González', '87654321-0', 'ABC123',
    'VIN123456789', 'Problema con el aire acondicionado', 'Alta'
) ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION optimacx.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_encuestas_updated_at 
    BEFORE UPDATE ON optimacx.encuestas 
    FOR EACH ROW EXECUTE FUNCTION optimacx.update_updated_at_column();

CREATE TRIGGER update_reclamos_updated_at 
    BEFORE UPDATE ON optimacx.reclamos 
    FOR EACH ROW EXECUTE FUNCTION optimacx.update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at 
    BEFORE UPDATE ON optimacx.knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION optimacx.update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA optimacx TO n8n;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA optimacx TO n8n;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA optimacx TO n8n;