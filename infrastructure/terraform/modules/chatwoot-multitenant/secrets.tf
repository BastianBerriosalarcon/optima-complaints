# Secret Management for Chatwoot Multitenant
# Following SOLID: Single Responsibility - Only manages secrets

# PostgreSQL password secret
resource "google_secret_manager_secret" "postgres_password" {
  secret_id = "chatwoot-postgres-password-${var.environment}"
  
  replication {
    auto {}
  }

  labels = {
    service     = "chatwoot"
    environment = var.environment
    type        = "database"
  }
}

resource "google_secret_manager_secret_version" "postgres_password" {
  secret      = google_secret_manager_secret.postgres_password.id
  secret_data = var.postgres_password
}

# Redis URL secret
resource "google_secret_manager_secret" "redis_url" {
  secret_id = "chatwoot-redis-url-${var.environment}"
  
  replication {
    auto {}
  }

  labels = {
    service     = "chatwoot"
    environment = var.environment
    type        = "cache"
  }
}

resource "google_secret_manager_secret_version" "redis_url" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = "redis://${var.redis_host}:${var.redis_port}"
}

# Secret key base for Rails
resource "google_secret_manager_secret" "secret_key_base" {
  secret_id = "chatwoot-secret-key-base-${var.environment}"
  
  replication {
    auto {}
  }

  labels = {
    service     = "chatwoot"
    environment = var.environment
    type        = "application"
  }
}

resource "random_password" "secret_key_base" {
  length  = 128
  special = true
}

resource "google_secret_manager_secret_version" "secret_key_base" {
  secret      = google_secret_manager_secret.secret_key_base.id
  secret_data = random_password.secret_key_base.result
}

# WhatsApp Business API secrets per tenant
resource "google_secret_manager_secret" "whatsapp_configs" {
  for_each = var.tenant_domains

  secret_id = "chatwoot-whatsapp-config-${each.key}-${var.environment}"
  
  replication {
    auto {}
  }

  labels = {
    service     = "chatwoot"
    environment = var.environment
    tenant      = each.key
    type        = "whatsapp"
  }
}

# Placeholder for WhatsApp config - will be updated via API/console
resource "google_secret_manager_secret_version" "whatsapp_configs" {
  for_each = var.tenant_domains

  secret      = google_secret_manager_secret.whatsapp_configs[each.key].id
  secret_data = jsonencode({
    business_account_id = "PLACEHOLDER"
    access_token       = "PLACEHOLDER"
    phone_number_id    = "PLACEHOLDER"
    webhook_verify_token = "PLACEHOLDER"
  })

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# Database URL secret for multitenant setup
resource "google_secret_manager_secret" "database_url" {
  secret_id = "chatwoot-database-url-${var.environment}"
  
  replication {
    auto {}
  }

  labels = {
    service     = "chatwoot"
    environment = var.environment
    type        = "database"
  }
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${var.postgres_username}:${var.postgres_password}@${var.postgres_host}:5432/postgres"
}