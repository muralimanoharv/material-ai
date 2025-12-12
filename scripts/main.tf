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
    "iam.googleapis.com",           # Required for Service Account management
    "aiplatform.googleapis.com"     # Required if using Vertex AI
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
# 2. SERVICE ACCOUNT & IAM ROLES (FIXED)
# ==============================================================================

# 1. DEFINE DATA SOURCE (Required to get project number)
data "google_project" "project" {
  project_id = var.project_id
}

# 2. Grant Permissions to Cloud Build (Default Compute Service Account)
resource "google_project_iam_member" "fix_cloud_build_permissions" {
  # We use for_each to assign multiple roles to the same account
  for_each = toset([
    # 1. REQUIRED: To download the source code zip file from the hidden GCS bucket
    "roles/storage.objectViewer",
    
    # 2. REQUIRED: To push the built Docker image to Artifact Registry
    "roles/artifactregistry.writer"
  ])

  project = var.project_id
  role    = each.key

  # This targets the Default Compute Service Account, which Cloud Build uses by default
  member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
  
  depends_on = [google_project_service.enabled_apis]
}

# 3. Create the Custom Service Account
resource "google_service_account" "app_sa" {
  account_id   = var.service_name
  display_name = "Service Account for ${var.service_name}"
  
  # FIX: Correct dependency syntax
  depends_on = [google_project_iam_member.fix_cloud_build_permissions]
}

# 4. Grant permissions to the Custom Service Account
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
}

# ==============================================================================
# 3. BUILD & PUSH IMAGE
# ==============================================================================

resource "null_resource" "build_and_push" {
  
  # Trigger: This ensures the build runs on every 'terraform apply'. 
  # Without this, Terraform would only build the image once and never again.
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<EOT
      # Generate a short SHA or fallback to timestamp
      COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || date -u +"%Y%m%dT%H%M%SZ")
      
      echo "Starting Cloud Build submit with tag: $COMMIT_SHA"

      gcloud builds submit .. \
        --config=../cloudbuild.yaml \
        --project=${var.project_id} \
        --substitutions=_GCR_PROJECT_ID=${var.project_id},_IMAGE_REPO=${google_artifact_registry_repository.docker_repo.name},_IMAGE_NAME=${var.image_name},_VERSION='latest',SHORT_SHA=$COMMIT_SHA
    EOT
  }
  depends_on = [
    google_artifact_registry_repository.docker_repo,      
    google_project_iam_member.fix_cloud_build_permissions
  ]
}

# ==============================================================================
# 4. CLOUD RUN DEPLOYMENT
# ==============================================================================

resource "google_cloud_run_v2_service" "app_service" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  template {
    # Force Revision: Ensures Cloud Run updates even if the image tag (:latest) is the same.
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