# Configuración específica de Supabase para el entorno dev

locals {
  supabase_config = {
    # URL real de Supabase hosteado
    url = "https://gdnlodwwmvbgayzzudiu.supabase.co"
    
    # Secrets que necesitan estar en Secret Manager
    required_secrets = [
      "supabase-service-key-dev",
      "supabase-anon-key-dev",
      "supabase-jwt-secret-dev"
    ]
    
    # Configuración de la base de datos
    database_config = {
      # Supabase maneja esto automáticamente
      # Solo necesitamos gestionar los secrets
    }
  }
}

# Output para usar en main.tf
output "supabase_config" {
  value = local.supabase_config
}
