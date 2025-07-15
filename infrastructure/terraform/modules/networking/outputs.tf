output "vpc_network" {
  description = "VPC network"
  value       = google_compute_network.vpc
}

output "subnet" {
  description = "Subnet for services"
  value       = google_compute_subnetwork.subnet
}

output "vpc_connector" {
  description = "VPC connector for Cloud Run"
  value       = google_vpc_access_connector.connector
}

output "lb_ip" {
  description = "Load balancer IP address"
  value       = google_compute_global_address.lb_ip.address
}

output "ssl_certificate" {
  description = "SSL certificate"
  value       = length(google_compute_managed_ssl_certificate.ssl_cert) > 0 ? google_compute_managed_ssl_certificate.ssl_cert[0] : null
}

output "security_policy" {
  description = "Cloud Armor security policy"
  value       = google_compute_security_policy.security_policy
}