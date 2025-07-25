# Development Environment Outputs

# Network outputs
output "vpc_network_name" {
  description = "VPC network name"
  value       = module.networking.vpc_network.name
}

output "vpc_connector_name" {
  description = "Name of the VPC connector"
  value       = module.networking.vpc_connector_id
}

output "load_balancer_ip" {
  description = "Load balancer IP address"
  value       = module.networking.lb_ip
}

# N8N service outputs - COMMENTED OUT TEMPORARILY
# output "n8n_service_name" {
#   description = "N8N service name"
#   value       = module.n8n.service_name
# }

# output "n8n_service_url" {
#   description = "N8N service URL"
#   value       = module.n8n.service_url
# }

# output "n8n_custom_domain_url" {
#   description = "N8N custom domain URL"
#   value       = module.n8n.custom_domain_url
# }

# Frontend service outputs - COMMENTED OUT TEMPORARILY
# output "frontend_service_name" {
#   description = "Frontend service name"
#   value       = module.frontend.service_name
# }

# output "frontend_service_url" {
#   description = "Frontend service URL"
#   value       = module.frontend.service_url
# }

# output "frontend_custom_domain_url" {
#   description = "Frontend custom domain URL"
#   value       = module.frontend.custom_domain_url
# }

# Chatwoot service outputs
output "chatwoot_service_name" {
  description = "Chatwoot service name"
  value       = module.chatwoot.service_name
}

output "chatwoot_service_url" {
  description = "Chatwoot service URL"
  value       = module.chatwoot.service_url
}

output "chatwoot_service_id" {
  description = "Chatwoot service ID"
  value       = module.chatwoot.service_id
}

output "chatwoot_custom_domain_url" {
  description = "Chatwoot custom domain URL"
  value       = module.chatwoot.custom_domain_url
}

# Supabase secrets outputs
output "supabase_url_secret" {
  description = "Supabase URL secret name"
  value       = module.supabase.supabase_url_secret
}

output "supabase_anon_key_secret" {
  description = "Supabase anon key secret name"
  value       = module.supabase.supabase_anon_key_secret
}

output "supabase_service_role_key_secret" {
  description = "Supabase service role key secret name"
  value       = module.supabase.supabase_service_role_key_secret
}

# Service account outputs
# output "n8n_service_account_email" {
#   description = "N8N service account email"
#   value       = module.security.n8n_service_account.email
# }

# output "frontend_service_account_email" {
#   description = "Frontend service account email"
#   value       = module.security.frontend_service_account.email
# }

output "chatwoot_service_account_email" {
  description = "Chatwoot service account email"
  value       = module.security.chatwoot_service_account.email
}