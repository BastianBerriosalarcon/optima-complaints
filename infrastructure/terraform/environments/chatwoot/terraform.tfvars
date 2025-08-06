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

# Domains for SSL certificates
domains = [
  "concesionario1.chat.optimacx.net",
  "concesionario2.chat.optimacx.net", 
  "concesionario3.chat.optimacx.net"
]

# Multitenant Configuration
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
  },
  {
    name        = "concesionario3"
    subdomain   = "concesionario3.chat.optimacx.net"
    whatsapp_number = "+56912345003"
  },
  {
    name        = "concesionario4"
    subdomain   = "concesionario4.chat.optimacx.net"
    whatsapp_number = "+56912345004"
  }
]
