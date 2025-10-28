-- Migración para crear tablas de métricas agregadas para dashboards.
-- Estas tablas serán pobladas periódicamente por workflows de n8n.



-- Tabla para métricas de reclamos
CREATE TABLE IF NOT EXISTS metricas_dashboard_reclamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concesionario_id UUID NOT NULL REFERENCES concesionarios(id) ON DELETE CASCADE,
  periodo VARCHAR(50) NOT NULL,
  fecha_calculo DATE NOT NULL,

  -- Métricas por Estado
  total_pendientes BIGINT DEFAULT 0,
  total_en_proceso BIGINT DEFAULT 0,
  total_cerrados BIGINT DEFAULT 0,
  total_reclamos BIGINT DEFAULT 0,

  -- Métricas por Tipo
  distribucion_por_tipo JSONB DEFAULT '{}'::jsonb, -- { "garantia": 10, "servicio": 25 }

  -- Métricas por Sucursal
  distribucion_por_sucursal JSONB DEFAULT '{}'::jsonb, -- { "sucursal_a": 15, "sucursal_b": 20 }

  -- Métricas de Tiempo
  tiempo_resolucion_promedio_horas NUMERIC(10, 2) DEFAULT 0,
  tiempo_primera_respuesta_promedio_horas NUMERIC(10, 2) DEFAULT 0,

  -- Black Alerts
  total_black_alerts BIGINT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraint para evitar duplicados por día y período
  UNIQUE(concesionario_id, periodo, fecha_calculo)
);

COMMENT ON TABLE metricas_dashboard_reclamos IS 'Almacena datos agregados sobre reclamos para optimizar la carga de dashboards.';

-- Trigger para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_encuestas
BEFORE UPDATE ON metricas_dashboard_encuestas
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_reclamos
BEFORE UPDATE ON metricas_dashboard_reclamos
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
