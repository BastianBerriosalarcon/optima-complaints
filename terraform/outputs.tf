# OptimaCx GCP - Terraform Outputs

output "n8n_url" {
  description = "URL of the n8n Cloud Run service"
  value       = google_cloud_run_service.n8n.status[0].url
}

output "n8n_service_name" {
  description = "Name of the n8n Cloud Run service"
  value       = google_cloud_run_service.n8n.name
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_private_ip" {
  description = "Private IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "database_public_ip" {
  description = "Public IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.public_ip_address
}

output "database_name" {
  description = "Name of the database"
  value       = google_sql_database.n8n_db.name
}

output "database_user" {
  description = "Database user name"
  value       = google_sql_user.n8n_user.name
  sensitive   = true
}

output "service_account_email" {
  description = "Email of the service account"
  value       = google_service_account.n8n_service_account.email
}

output "vpc_network_name" {
  description = "Name of the VPC network"
  value       = google_compute_network.vpc.name
}

output "subnet_name" {
  description = "Name of the subnet"
  value       = google_compute_subnetwork.subnet.name
}

output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP Region"
  value       = var.region
}

output "zone" {
  description = "GCP Zone"
  value       = var.zone
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

# Webhook URLs for different functionalities
output "webhook_survey_qr" {
  description = "Webhook URL for QR surveys"
  value       = "${google_cloud_run_service.n8n.status[0].url}/webhook/encuesta-qr"
}

output "webhook_survey_submit" {
  description = "Webhook URL for survey submissions"
  value       = "${google_cloud_run_service.n8n.status[0].url}/webhook/encuesta-qr-submit"
}

output "webhook_whatsapp" {
  description = "Webhook URL for WhatsApp integration"
  value       = "${google_cloud_run_service.n8n.status[0].url}/webhook/whatsapp"
}

output "webhook_complaint" {
  description = "Webhook URL for complaint processing"
  value       = "${google_cloud_run_service.n8n.status[0].url}/webhook/complaint"
}

# Connection details for applications
output "database_connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://${google_sql_user.n8n_user.name}:${google_sql_user.n8n_user.password}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.n8n_db.name}"
  sensitive   = true
}

output "deployment_timestamp" {
  description = "Timestamp of the deployment"
  value       = timestamp()
}

output "terraform_version" {
  description = "Terraform version used"
  value       = "~> 1.0"
}