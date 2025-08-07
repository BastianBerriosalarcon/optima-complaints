# Chatwoot Environment Variables - Chile/Sudamérica

project_id = "optima-cx-467616"
region     = "southamerica-west1"
environment = "dev"

# Supabase Configuration (São Paulo - SA-East-1)
supabase_host     = "aws-0-sa-east-1.pooler.supabase.com"
supabase_username = "postgres.jmadjtspbxijehgltyaf"
supabase_port     = 6543

# Chatwoot Configuration
chatwoot_image = "chatwoot/chatwoot:v4.4.0"

# Cloud SQL Santiago Configuration - Económico y optimizado para Chile
use_cloud_sql_santiago = true
chatwoot_db_password   = "Junio.0706"

# Domains for SSL certificates (Solo para pruebas iniciales)
domains = [
  "concesionario1.chat.optimacx.net",
  "concesionario2.chat.optimacx.net"
]

# Multitenant Configuration (Solo 2 concesionarios de prueba)
tenant_configs = [
  {
    name        = "concesionario1"
    subdomain   = "concesionario1.chat.optimacx.net"
    whatsapp_number = "+56912345001"
  },
  {
    name        = "concesionario2"
    subdomain   = "concesionario2.chat.optimacx.net"
    whatsapp_number = "+56912345002"
  }
]

# === OPTIMIZACIONES DE RENDIMIENTO ULTRA-AGRESIVAS ===

# Instancias mínimas para evitar cold starts (ajustado a quota disponible)
min_instances = "2"
max_instances = "5"  # Límite de quota actual
max_concurrency = 120

# Recursos optimizados para Rails
cpu = "4000m"  # 4 CPU cores para boot más rápido
memory = "6Gi"  # Más memoria para caching Rails

# Timeouts optimizados
timeout_seconds = 900  # 15 minutos para requests largos
