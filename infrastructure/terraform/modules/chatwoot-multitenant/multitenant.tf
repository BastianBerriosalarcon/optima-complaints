# Multitenant Configuration for Chatwoot
# Following SOLID: Single Responsibility - Manages only multitenant infrastructure

# Domain mappings for each tenant
# NOTA: Domain mappings no están disponibles en southamerica-west1
# Usaremos Load Balancer para custom domains en una versión futura
/*
resource "google_cloud_run_domain_mapping" "tenant_domains" {
  for_each = var.tenant_domains

  location = var.region
  name     = each.value

  metadata {
    namespace = var.project_id
    labels = {
      tenant      = each.key
      service     = "chatwoot"
      environment = var.environment
    }
  }

  spec {
    route_name = google_cloud_run_service.chatwoot_multitenant.name
  }
}
*/

# Load balancer for multitenant routing (if needed) - TEMPORALMENTE COMENTADO
/*
resource "google_compute_global_address" "chatwoot_ip" {
  count = length(var.tenant_domains) > 0 ? 1 : 0

  name         = "chatwoot-multitenant-ip-${var.environment}"
  ip_version   = "IPV4"
  address_type = "EXTERNAL"
}

# SSL certificates for tenant domains - TEMPORALMENTE COMENTADO  
resource "google_compute_managed_ssl_certificate" "tenant_ssl_certs" {
  for_each = var.tenant_domains

  name = "chatwoot-ssl-${replace(each.key, "_", "-")}-${var.environment}"

  managed {
    domains = [each.value]
  }

  lifecycle {
    create_before_destroy = true
  }
}
*/

# Cloud Armor security policy - Comentado por límites de quota
# resource "google_compute_security_policy" "chatwoot_security_policy" {
#   name        = "chatwoot-security-policy-${var.environment}"
#   description = "Security policy for Chatwoot multitenant deployment"
# }

# Monitoring dashboard for multitenant Chatwoot
# Monitoring Dashboard - Temporalmente comentado para resolver errores de configuración
# resource "google_monitoring_dashboard" "chatwoot_multitenant_dashboard" {
#   count = var.enable_monitoring ? 1 : 0
#   dashboard_json = jsonencode({
#     displayName = "Chatwoot Multitenant - ${var.environment}"
#   })
# }

# Alerting policy - Temporalmente comentado para resolver errores
# resource "google_monitoring_alert_policy" "chatwoot_error_rate" {
#   count = var.enable_monitoring ? 1 : 0
#   display_name = "Chatwoot High Error Rate - ${var.environment}"
#   combiner     = "OR"
# }

# Log-based metrics - Temporalmente comentado para resolver errores
# resource "google_logging_metric" "tenant_requests" {
#   for_each = var.tenant_domains
#   name   = "chatwoot_tenant_requests_${replace(each.key, "-", "_")}_${var.environment}"
#   filter = "resource.type=\"cloud_run_revision\""
# }