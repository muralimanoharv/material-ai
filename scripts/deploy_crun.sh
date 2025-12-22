#!/bin/bash
set -e
ENVIRONMENT=$1
echo "🚀 STARTING: Deployment...."

source ./auth.sh

source ./setup.sh

./terraform init

./terraform apply \
  -var="project_id=$PROJECT_ID" \
  -var="region=$PROJECT_DEFAULT_LOCATION" \
  -var="repo_name=$CRUN_CONTAINER_REPO" \
  -var="image_name=$CRUN_IMAGE" \
  -var="service_name=$CRUN_SERVICE" \
  -var="sso_client_id=$SSO_CLIENT_ID" \
  -var="sso_client_secret=$SSO_CLIENT_SECRET" \
  -var="sso_redirect_uri=$SSO_REDIRECT_URI" \
  -var="sso_session_secret_key=$SSO_SESSION_SECRET_KEY" \
  -var="config_path=$CONFIG_PATH" \
  -var="google_genai_use_vertexai=$GOOGLE_GENAI_USE_VERTEXAI" \
  -var="google_api_key=$GOOGLE_API_KEY" \
  -var="adk_session_db_url=$ADK_SESSION_DB_URL" 

