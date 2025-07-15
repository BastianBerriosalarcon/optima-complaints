variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "instance_name" {
  description = "Name of the Cloud SQL instance"
  type        = string
}

variable "database_version" {
  description = "Database version"
  type        = string
  default     = "POSTGRES_15"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "southamerica-west1"
}

variable "tier" {
  description = "Database tier"
  type        = string
  default     = "db-f1-micro"
}

variable "availability_type" {
  description = "Availability type"
  type        = string
  default     = "ZONAL"
}

variable "disk_size" {
  description = "Disk size in GB"
  type        = number
  default     = 20
}

variable "disk_type" {
  description = "Disk type"
  type        = string
  default     = "PD_SSD"
}

variable "disk_autoresize" {
  description = "Enable disk autoresize"
  type        = bool
  default     = true
}

variable "disk_autoresize_limit" {
  description = "Disk autoresize limit in GB"
  type        = number
  default     = 100
}

variable "deletion_protection_enabled" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "backup_enabled" {
  description = "Enable backups"
  type        = bool
  default     = true
}

variable "backup_start_time" {
  description = "Backup start time"
  type        = string
  default     = "03:00"
}

variable "point_in_time_recovery_enabled" {
  description = "Enable point in time recovery"
  type        = bool
  default     = true
}

variable "transaction_log_retention_days" {
  description = "Transaction log retention days"
  type        = number
  default     = 7
}

variable "retained_backups" {
  description = "Number of retained backups"
  type        = number
  default     = 7
}

variable "ipv4_enabled" {
  description = "Enable IPv4"
  type        = bool
  default     = false
}

variable "private_network" {
  description = "Private network for the instance"
  type        = string
  default     = ""
}

variable "enable_private_path_for_google_cloud_services" {
  description = "Enable private path for Google Cloud services"
  type        = bool
  default     = true
}

variable "authorized_networks" {
  description = "Authorized networks"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "database_flags" {
  description = "Database flags"
  type = list(object({
    name  = string
    value = string
  }))
  default = [
    {
      name  = "log_checkpoints"
      value = "on"
    },
    {
      name  = "log_connections"
      value = "on"
    },
    {
      name  = "log_disconnections"
      value = "on"
    },
    {
      name  = "log_lock_waits"
      value = "on"
    },
    {
      name  = "log_temp_files"
      value = "0"
    },
    {
      name  = "log_min_duration_statement"
      value = "1000"
    }
  ]
}

variable "maintenance_window_day" {
  description = "Maintenance window day"
  type        = number
  default     = 7
}

variable "maintenance_window_hour" {
  description = "Maintenance window hour"
  type        = number
  default     = 4
}

variable "maintenance_window_update_track" {
  description = "Maintenance window update track"
  type        = string
  default     = "stable"
}

variable "query_insights_enabled" {
  description = "Enable query insights"
  type        = bool
  default     = true
}

variable "query_string_length" {
  description = "Query string length"
  type        = number
  default     = 1024
}

variable "record_application_tags" {
  description = "Record application tags"
  type        = bool
  default     = true
}

variable "record_client_address" {
  description = "Record client address"
  type        = bool
  default     = true
}

variable "databases" {
  description = "Databases to create"
  type = map(object({
    charset   = string
    collation = string
  }))
  default = {}
}

variable "users" {
  description = "Users to create"
  type = map(object({
    password = string
  }))
  default = {}
}

variable "project_services" {
  description = "List of enabled GCP services"
  type        = list(string)
  default     = []
}