# Security Module - IAM, Service Accounts, and Permissions

# Service Account for N8N
resource "google_service_account" "n8n_service_account" {
  account_id   = "n8n-service-account-${var.environment}"
  display_name = "Service Account for N8N - ${var.environment}"
  description  = "Service account for N8N Cloud Run service"
  project      = var.project_id
}

# Service Account for OptimaCX Frontend
resource "google_service_account" "frontend_service_account" {
  account_id   = "frontend-service-account-${var.environment}"
  display_name = "Service Account for Frontend - ${var.environment}"
  description  = "Service account for OptimaCX Frontend Cloud Run service"
  project      = var.project_id
}

# Service Account for Chatwoot
resource "google_service_account" "chatwoot_service_account" {
  account_id   = "chatwoot-service-account-${var.environment}"
  display_name = "Service Account for Chatwoot - ${var.environment}"
  description  = "Service account for Chatwoot Cloud Run service"
  project      = var.project_id
}

# IAM bindings for Secret Manager access
resource "google_project_iam_member" "n8n_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.n8n_service_account.email}"
}

resource "google_project_iam_member" "frontend_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.frontend_service_account.email}"
}

resource "google_project_iam_member" "chatwoot_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.chatwoot_service_account.email}"
}

# IAM bindings for Cloud SQL client (if needed)
resource "google_project_iam_member" "n8n_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.n8n_service_account.email}"
}

resource "google_project_iam_member" "chatwoot_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.chatwoot_service_account.email}"
}

# IAM binding for Cloud Storage (if needed for file uploads)
resource "google_project_iam_member" "frontend_storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.frontend_service_account.email}"
}

# IAM binding for AI Platform (for OpenAI integrations)
resource "google_project_iam_member" "n8n_ai_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.n8n_service_account.email}"
}