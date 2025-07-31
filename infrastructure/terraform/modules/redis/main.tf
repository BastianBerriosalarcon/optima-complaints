# Redis Module - Cloud Memorystore for Chatwoot

# Private Service Connection for Redis
resource "google_compute_global_address" "redis_private_ip" {
  name          = "${var.instance_name}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = var.vpc_network_id
  project       = var.project_id
}

resource "google_service_networking_connection" "redis_private_vpc_connection" {
  network                 = var.vpc_network_id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.redis_private_ip.name]
}

# Redis Instance
resource "google_redis_instance" "main" {
  name           = var.instance_name
  tier           = var.tier
  memory_size_gb = var.memory_size_gb
  region         = var.region
  project        = var.project_id

  location_id             = var.location_id
  

  authorized_network = var.vpc_network_id
  connect_mode       = var.connect_mode
  redis_version      = var.redis_version
  display_name       = var.display_name

  redis_configs = var.redis_configs

  labels = var.labels

  depends_on = [
    google_service_networking_connection.redis_private_vpc_connection,
    var.project_services
  ]
}

# Create secret for Redis connection
resource "google_secret_manager_secret" "redis_url" {
  secret_id = "${var.instance_name}-redis-url"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "redis_url" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = "redis://${google_redis_instance.main.host}:${google_redis_instance.main.port}"
}