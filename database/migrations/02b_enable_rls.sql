-- =====================================================
-- OptimaCx - Habilitar RLS en todas las tablas
-- Parte 2: Activación de Row Level Security
-- =====================================================

-- Habilitar RLS en tablas críticas
-- Este script asegura que RLS esté activado en las tablas principales
-- para garantizar el aislamiento de datos entre tenants.

ALTER TABLE public.concesionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reclamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_conocimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;

-- Mensaje de confirmación
SELECT 'RLS habilitado en tablas críticas' as status;