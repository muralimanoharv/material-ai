# ==============================================================================
# VARIABLES
# ==============================================================================

variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The region for resources"
  type        = string
  default     = "us-central1"
}

variable "repo_name" {
  description = "The name of the Artifact Registry repository"
  type        = string
}

variable "image_name" {
  description = "The name of the Docker image"
  type        = string
}

variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
}

# Application Config & Secrets (Passed as Env Vars for now)
variable "sso_client_id" { type = string }
variable "sso_client_secret" { type = string }
variable "sso_redirect_uri" { type = string }
variable "sso_session_secret_key" { type = string }
variable "config_path" { type = string }
variable "google_genai_use_vertexai" { type = string }
variable "google_api_key" { type = string }
variable "adk_session_db_url" { type = string }



# ==============================================================================
# PROVIDER & APIS
# ==============================================================================

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "gcp_services" {
  type = list(string)
  default = [
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "iam.googleapis.com",
    "aiplatform.googleapis.com"
  ]
}

resource "google_project_service" "enabled_apis" {
  for_each           = toset(var.gcp_services)
  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

# ==============================================================================
# 1. ARTIFACT REGISTRY
# ==============================================================================

resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = var.repo_name
  description   = "Docker repository for ${var.service_name}"
  format        = "DOCKER"

  depends_on = [google_project_service.enabled_apis]
}

# ==============================================================================
# 2. BUILD IDENTITY (NEW: Safe & Isolated)
# ==============================================================================

# 1. Create a dedicated Service Account for the Build Process
resource "google_service_account" "build_sa" {
  account_id   = substr("${var.service_name}-build-sa", 0, 30)
  display_name = "Build SA for ${var.service_name}"
  description  = "Used exclusively by Cloud Build to build and push images for ${var.service_name}"
}

# 2. Grant permissions ONLY to this new Build Service Account
resource "google_project_iam_member" "build_sa_permissions" {
  for_each = toset([
    "roles/logging.logWriter",       
    "roles/storage.objectViewer",    
    "roles/artifactregistry.writer",
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.build_sa.email}"
  
  depends_on = [
    google_project_service.enabled_apis,
    google_service_account.build_sa
  ]
}

# ==============================================================================
# 3. RUNTIME IDENTITY (Application Service Account)
# ==============================================================================

# 1. Create the Custom Service Account for the Application
resource "google_service_account" "app_sa" {
  # Truncate service_name to 30 characters to meet GCP constraints
  account_id   = substr(var.service_name, 0, 30)
  display_name = "Service Account for ${var.service_name}"
}

# 2. Grant permissions to the Runtime Service Account
resource "google_project_iam_member" "sa_permissions" {
  for_each = toset([
    "roles/logging.logWriter",        
    "roles/aiplatform.user",          
    "roles/datastore.user",           
    "roles/storage.objectViewer"      
  ])
   
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.app_sa.email}"
  depends_on = [
    google_project_service.enabled_apis,
    google_service_account.app_sa
  ]
}

# ==============================================================================
# 4. BUILD & PUSH IMAGE
# ==============================================================================

resource "null_resource" "build_and_push" {
   
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<EOT
      # Generate a short SHA or fallback to timestamp
      COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || date -u +"%Y%m%dT%H%M%SZ")
      
      echo "Starting Cloud Build submit with tag: $COMMIT_SHA"

      # --- ADDED DELAY HERE ---
      # Force wait for IAM permissions (which are "eventually consistent") to propagate
      echo "Waiting 60 seconds for IAM permissions to propagate globally..."
      sleep 60
      # ------------------

      # UPDATED: Added --service-account flag to use our safe, dedicated build account
      gcloud builds submit .. \
        --config=../cloudbuild.yaml \
        --project=${var.project_id} \
        --service-account=${google_service_account.build_sa.name} \
        --substitutions=_GCR_PROJECT_ID=${var.project_id},_IMAGE_REPO=${google_artifact_registry_repository.docker_repo.name},_IMAGE_NAME=${var.image_name},_VERSION='latest',SHORT_SHA=$COMMIT_SHA
    EOT
  }

  depends_on = [
    google_artifact_registry_repository.docker_repo,      
    google_project_iam_member.build_sa_permissions, # Wait for build permissions to propagate
    google_project_service.enabled_apis
  ]
}

# ==============================================================================
# 5. CLOUD RUN DEPLOYMENT
# ==============================================================================

resource "google_cloud_run_v2_service" "app_service" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  template {
    annotations = {
      "run.googleapis.com/client-name" = "terraform"
      "revision-trigger"               = null_resource.build_and_push.id 
    }

    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"
    timeout               = "600s"
    service_account       = google_service_account.app_sa.email
    max_instance_request_concurrency = 2

    scaling {
      min_instance_count = 1
      max_instance_count = 1
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.name}/${var.image_name}:latest"

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
        startup_cpu_boost = true
      }

      # Environment Variables
      env {
        name  = "SSO_CLIENT_ID"
        value = var.sso_client_id
      }
      env {
        name  = "SSO_CLIENT_SECRET"
        value = var.sso_client_secret
      }
      env {
        name  = "SSO_REDIRECT_URI"
        value = var.sso_redirect_uri
      }
      env {
        name  = "SSO_SESSION_SECRET_KEY"
        value = var.sso_session_secret_key
      }
      env {
        name  = "CONFIG_PATH"
        value = var.config_path
      }
      env {
        name  = "GOOGLE_GENAI_USE_VERTEXAI"
        value = var.google_genai_use_vertexai
      }
      env {
        name  = "GOOGLE_API_KEY"
        value = var.google_api_key
      }
      env {
        name  = "ADK_SESSION_DB_URL"
        value = var.adk_session_db_url
      }
    }
  }

  depends_on = [
    null_resource.build_and_push,
    google_project_iam_member.sa_permissions
  ]
}