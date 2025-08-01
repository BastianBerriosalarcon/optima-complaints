# Networking Module - VPC, Subnets, Load Balancer, SSL

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "optimacx-vpc-${var.environment}"
  auto_create_subnetworks = false
  project                 = var.project_id
}

# Subnet for Cloud Run services
resource "google_compute_subnetwork" "subnet" {
  name          = "optimacx-subnet-${var.environment}"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc.id
  project       = var.project_id
}

# VPC Connector for Cloud Run
resource "google_vpc_access_connector" "connector" {
  name          = "optimacx-connector-${var.environment}"
  ip_cidr_range = var.connector_cidr
  network       = google_compute_network.vpc.name
  region        = var.region
  project       = var.project_id

  depends_on = [var.project_services]
}

# Global External IP for Load Balancer
resource "google_compute_global_address" "lb_ip" {
  name         = "optimacx-lb-ip-${var.environment}"
  project      = var.project_id
  address_type = "EXTERNAL"
}

# SSL Certificate (managed)
resource "google_compute_managed_ssl_certificate" "ssl_cert" {
  count = length(var.domains) > 0 ? 1 : 0
  name  = "optimacx-ssl-cert-${var.environment}"

  managed {
    domains = var.domains
  }

  project = var.project_id
}

# Cloud Armor Security Policy
# resource "google_compute_security_policy" "security_policy" {
  
  #   description = "Security policy for OptimaCX platform"
#   project     = var.project_id
# 
#   # Default rule - allow all
#   rule {
#     action   = "allow"
#     priority = "2147483647"
#     match {
#       versioned_expr = "SRC_IPS_V1"
#       config {
#         src_ip_ranges = ["*"]
#       }
#     }
#     description = "default rule"
#   }
# 
#   # Rate limiting rule
#   rule {
#     action   = "rate_based_ban"
#     priority = "1000"
#     match {
#       versioned_expr = "SRC_IPS_V1"
#       config {
#         src_ip_ranges = ["*"]
#       }
#     }
#     rate_limit_options {
#       conform_action = "allow"
#       exceed_action  = "deny(429)"
#       enforce_on_key = "IP"
#       rate_limit_threshold {
#         count        = 100
#         interval_sec = 60
#       }
#       ban_duration_sec = 300
#     }
#     description = "Rate limiting rule"
#   }
# }

# Cloud Router for NAT
resource "google_compute_router" "router" {
  name    = "optimacx-router-${var.environment}"
  network = google_compute_network.vpc.name
  region  = var.region
  project = var.project_id
}

# Cloud NAT for static egress IP
resource "google_compute_router_nat" "nat" {
  name                               = "optimacx-nat-${var.environment}"
  router                             = google_compute_router.router.name
  region                             = var.region
  project                            = var.project_id
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"
  subnetwork {
    name                    = google_compute_subnetwork.subnet.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }
  nat_ip_allocate_option             = "MANUAL_ONLY"
  nat_ips                            = [google_compute_address.nat_ip.self_link]
}

# Static IP address for Cloud NAT
resource "google_compute_address" "nat_ip" {
  name    = "optimacx-nat-ip-${var.environment}"
  region  = var.region
  project = var.project_id
}