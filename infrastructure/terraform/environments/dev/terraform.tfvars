# Valores específicos para el entorno de desarrollo
# Este archivo contiene los valores reales para las variables

# Proyecto y región
project_id = "optima-cx-467616"
region     = "southamerica-west1"
environment = "dev"

# N8N Configuration (valores reales del deployment actual)
n8n_image = "southamerica-west1-docker.pkg.dev/optima-cx-467616/n8n/n8n-multitenant:latest"
n8n_cpu_limit = "2"
n8n_memory_limit = "2Gi"
n8n_max_instances = 3

# Supabase Configuration (valores reales)
supabase_url = "https://gdnlodwwmvbgayzzudiu.supabase.co"
supabase_service_key_secret = "supabase-service-key-dev"

# Nota: supabase_anon_key se define en variables.tf como default
# para mantener consistencia con la configuración actual
