# Entorno de Desarrollo - Óptima-CX
# Configuración unificada de todos los servicios

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# N8N Service
module "n8n" {
  source = "../../services/n8n"
  
  project_id = var.project_id
  region     = var.region
  
  # N8N specific configuration
  service_name = "n8n-optimacx-${var.environment}"
  image        = var.n8n_image
  
  # Resources
  cpu_limit      = var.n8n_cpu_limit
  memory_limit   = var.n8n_memory_limit
  max_instances  = var.n8n_max_instances
  
  # Supabase configuration
  supabase_url      = var.supabase_url
  supabase_anon_key = var.supabase_anon_key
  
  # Secret Manager
  supabase_service_key_secret = var.supabase_service_key_secret
  
  environment = var.environment
}

# Chatwoot Service
module "chatwoot" {
  source = "../../services/chatwoot"
  
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  
  # Dependencies
  depends_on = [module.n8n]
}

# Supabase Secrets Management
module "supabase" {
  source = "../../services/supabase"
  
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}
