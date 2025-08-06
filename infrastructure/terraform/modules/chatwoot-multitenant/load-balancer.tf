# Global HTTPS Load Balancer for Chatwoot Multitenant - TEMPORALMENTE DESACTIVADO
# Routes traffic based on domain to the same Cloud Run service with different host headers
# NOTA: Comentado para ahorrar ~$45 USD/mes durante desarrollo sin dominios

/*
# Backend Service for Cloud Run
resource "google_compute_backend_service" "chatwoot_backend" {
  name                    = "chatwoot-backend-${var.environment}"
  description             = "Backend service for Chatwoot multitenant"
  protocol                = "HTTPS"
  timeout_sec             = 30
  enable_cdn              = false
  load_balancing_scheme   = "EXTERNAL"

  backend {
    group = google_compute_region_network_endpoint_group.chatwoot_neg.id
  }

  log_config {
    enable = true
  }
}

# Network Endpoint Group (NEG) for Cloud Run
resource "google_compute_region_network_endpoint_group" "chatwoot_neg" {
  name                  = "chatwoot-neg-${var.environment}"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_service.chatwoot_multitenant.name
  }
}

# URL Map for routing different domains to the same backend
resource "google_compute_url_map" "chatwoot_url_map" {
  name            = "chatwoot-url-map-${var.environment}"
  description     = "URL map for Chatwoot multitenant routing"
  default_service = google_compute_backend_service.chatwoot_backend.id

  # Host rules for each tenant domain
  dynamic "host_rule" {
    for_each = var.tenant_configs
    content {
      hosts        = [host_rule.value.subdomain]
      path_matcher = "tenant-${host_rule.value.name}"
    }
  }

  # Path matchers for each tenant
  dynamic "path_matcher" {
    for_each = var.tenant_configs
    content {
      name            = "tenant-${path_matcher.value.name}"
      default_service = google_compute_backend_service.chatwoot_backend.id

      # Optional: Add specific path rules if needed per tenant
      path_rule {
        paths   = ["/*"]
        service = google_compute_backend_service.chatwoot_backend.id
      }
    }
  }
}

# Target HTTPS Proxy
resource "google_compute_target_https_proxy" "chatwoot_https_proxy" {
  name   = "chatwoot-https-proxy-${var.environment}"
  url_map = google_compute_url_map.chatwoot_url_map.id
  
  # Use all tenant SSL certificates
  ssl_certificates = [
    for cert_key, cert in google_compute_managed_ssl_certificate.tenant_ssl_certs : cert.id
  ]
}

# Global Forwarding Rule (HTTPS - Port 443)
resource "google_compute_global_forwarding_rule" "chatwoot_https_forwarding_rule" {
  name       = "chatwoot-https-forwarding-rule-${var.environment}"
  target     = google_compute_target_https_proxy.chatwoot_https_proxy.id
  port_range = "443"
  ip_address = google_compute_global_address.chatwoot_ip[0].id
}

# HTTP to HTTPS Redirect
resource "google_compute_url_map" "chatwoot_http_redirect" {
  name = "chatwoot-http-redirect-${var.environment}"
  
  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "chatwoot_http_proxy" {
  name    = "chatwoot-http-proxy-${var.environment}"
  url_map = google_compute_url_map.chatwoot_http_redirect.id
}

resource "google_compute_global_forwarding_rule" "chatwoot_http_forwarding_rule" {
  name       = "chatwoot-http-forwarding-rule-${var.environment}"
  target     = google_compute_target_http_proxy.chatwoot_http_proxy.id
  port_range = "80"
  ip_address = google_compute_global_address.chatwoot_ip[0].id
}
*/
