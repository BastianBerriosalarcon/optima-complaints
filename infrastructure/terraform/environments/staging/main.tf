# Entorno de Staging - Óptima-CX
# Configuración para testing y QA

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  
  # Backend para staging
  # backend "gcs" {
  #   bucket = "optima-cx-terraform-state"
  #   prefix = "environments/staging"
  # }
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
  
  service_name = "n8n-optimacx-${var.environment}"
  image        = var.n8n_image
  
  cpu_limit      = var.n8n_cpu_limit
  memory_limit   = var.n8n_memory_limit
  max_instances  = var.n8n_max_instances
  
  supabase_url      = var.supabase_url
  supabase_anon_key = var.supabase_anon_key
  supabase_service_key_secret = var.supabase_service_key_secret
  
  environment = var.environment
}

# Chatwoot Service  
module "chatwoot" {
  source = "../../services/chatwoot"
  
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  
  depends_on = [module.n8n]
}

# Supabase Secrets Management
module "supabase" {
  source = "../../services/supabase"
  
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}
