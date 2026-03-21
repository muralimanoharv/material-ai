terraform {
  backend "gcs" {
    bucket  = "material_ai_tf" 
    prefix  = "terraform/state"
  }
}

# Define the list of roles from your image
variable "github_actions_roles" {
  type = list(string)
  default = [
    "roles/artifactregistry.writer",
    "roles/cloudbuild.builds.editor",
    "roles/run.admin",
    "roles/iam.securityAdmin",
    "roles/iam.serviceAccountUser",
    "roles/serviceusage.serviceUsageAdmin",
    "roles/storage.admin",
    "roles/viewer"
  ]
}

# 1. The Workload Identity Pool
resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "mai-github-actions-pool"
  display_name              = "Material AI GitHub Actions Pool"
}

# 2. The Identity Provider
resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.actor"      = "assertion.actor"
  }
  attribute_condition = "assertion.repository == 'muralimanoharv/material-ai'"
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# 3. The Service Account
resource "google_service_account" "github_sa" {
  account_id   = "mai-github-actions-deployer"
  display_name = "Service Account for GitHub Actions material_ai"
}

# 4. Binding the roles to the Service Account
resource "google_project_iam_member" "github_sa_roles" {
  for_each = toset(var.github_actions_roles)
  project  = var.project_id
  role     = each.key
  member   = "serviceAccount:${google_service_account.github_sa.email}"
}

# 5. Allow GitHub to impersonate this Service Account
resource "google_service_account_iam_member" "wif_impersonation" {
  service_account_id = google_service_account.github_sa.name
  role               = "roles/iam.workloadIdentityUser"
  # Replace 'username/repo' with your actual repo
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/muralimanoharv/material-ai"
}