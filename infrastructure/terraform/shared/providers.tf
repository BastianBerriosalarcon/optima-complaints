# Configuración Compartida de Terraform

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

# Backend configuration (puede ser customizado por entorno)
# terraform {
#   backend "gcs" {
#     bucket = "optima-cx-terraform-state"
#     prefix = "environments/dev"
#   }
# }
