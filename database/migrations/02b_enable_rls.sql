-- =====================================================
-- OptimaCx - Habilitar RLS en todas las tablas
-- Parte 2: Activación de Row Level Security
-- =====================================================

-- Habilitar RLS en todas las tablas principales
ALTER TABLE public.concesionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reclamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_conocimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;