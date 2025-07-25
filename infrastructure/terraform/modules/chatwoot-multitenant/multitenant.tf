# Multitenant Configuration for Chatwoot
# Following SOLID: Single Responsibility - Manages only multitenant infrastructure

# Domain mappings for each tenant
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

# Load balancer for multitenant routing (if needed)
resource "google_compute_global_address" "chatwoot_ip" {
  count = length(var.tenant_domains) > 0 ? 1 : 0

  name         = "chatwoot-multitenant-ip-${var.environment}"
  ip_version   = "IPV4"
  address_type = "EXTERNAL"
}

# SSL certificates for tenant domains
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

# Cloud Armor security policy for Chatwoot
resource "google_compute_security_policy" "chatwoot_security_policy" {
  name        = "chatwoot-security-policy-${var.environment}"
  description = "Security policy for Chatwoot multitenant deployment"

  # Default rule
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow rule"
  }

  # Rate limiting rule
  rule {
    action   = "throttle"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
    }
    description = "Rate limiting: 100 requests per minute per IP"
  }

  # Block common attack patterns
  rule {
    action   = "deny(403)"
    priority = "500"
    match {
      expr {
        expression = "request.headers['user-agent'].contains('sqlmap') || request.headers['user-agent'].contains('nikto')"
      }
    }
    description = "Block common scanning tools"
  }
}

# Monitoring dashboard for multitenant Chatwoot
resource "google_monitoring_dashboard" "chatwoot_multitenant_dashboard" {
  count = var.enable_monitoring ? 1 : 0

  dashboard_json = jsonencode({
    displayName = "Chatwoot Multitenant - ${var.environment}"
    mosaicLayout = {
      tiles = [
        {
          width  = 6
          height = 4
          widget = {
            title = "Request Count by Tenant"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${local.service_name}\""
                    aggregation = {
                      alignmentPeriod  = "60s"
                      perSeriesAligner = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                      groupByFields = ["resource.labels.revision_name"]
                    }
                  }
                }
                plotType = "LINE"
              }]
              timeshiftDuration = "0s"
              yAxis = {
                label = "Requests/sec"
                scale = "LINEAR"
              }
            }
          }
        },
        {
          width  = 6
          height = 4
          widget = {
            title = "Response Latency"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${local.service_name}\""
                    aggregation = {
                      alignmentPeriod  = "60s"
                      perSeriesAligner = "ALIGN_MEAN"
                    }
                  }
                }
                plotType = "LINE"
              }]
              yAxis = {
                label = "Latency (ms)"
                scale = "LINEAR"
              }
            }
          }
        }
      ]
    }
  })
}

# Alerting policy for high error rates
resource "google_monitoring_alert_policy" "chatwoot_error_rate" {
  count = var.enable_monitoring ? 1 : 0

  display_name = "Chatwoot High Error Rate - ${var.environment}"
  combiner     = "OR"

  conditions {
    display_name = "Error rate too high"
    
    condition_threshold {
      filter         = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${local.service_name}\""
      duration       = "300s"
      comparison     = "COMPARISON_GT"
      threshold_value = 0.05  # 5% error rate

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_MEAN"
      }
    }
  }

  notification_channels = var.notification_channels

  alert_strategy {
    auto_close = "86400s"  # 24 hours
  }
}

# Log-based metrics for tenant-specific monitoring
resource "google_logging_metric" "tenant_requests" {
  for_each = var.tenant_domains

  name   = "chatwoot_tenant_requests_${replace(each.key, "-", "_")}_${var.environment}"
  filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${local.service_name}\" AND httpRequest.requestUrl=~\"${each.value}\""

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    display_name = "Chatwoot Tenant Requests - ${each.key}"
  }

  value_extractor = "EXTRACT(httpRequest.status)"
}