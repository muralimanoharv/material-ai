#!/bin/bash
set -e
ENVIRONMENT=$1
echo "🚀 STARTING: Deployment...."

source ./setup.sh

# Create Docker Repository
echo "⚙️  STARTING: Creating Artifact Registry..."
echo

if gcloud artifacts repositories describe ${CRUN_CONTAINER_REPO} --location=${PROJECT_DEFAULT_LOCATION} &> /dev/null; then
  
  echo "✅ Repository '${CRUN_CONTAINER_REPO}' already exists."

else
  
  echo "🚧 Repository not found. Creating..."
  gcloud artifacts repositories create ${CRUN_CONTAINER_REPO} \
      --repository-format=docker \
      --location=${PROJECT_DEFAULT_LOCATION} \
      --description="Repo for Cloud run docker images"
      
  echo "🟢 SUCCESS: Repository created."

fi

echo
# Prompt the user, suggesting 'N' as the default. Allow them to press Enter.
read -p "🚧 Build and push image to Artifact Registry? (y/N) (default: N): " REPLY
echo # Move to a new line

# Check the user's reply
case "$REPLY" in
  y|Y )
    # This block only runs if the user explicitly types 'y' or 'Y'
    source ./cloudbuild.sh
    ;;
  ""|n|N )
    # This block runs if the user types 'n', 'N', or just presses Enter ("")
    echo "⚙️  Skipping build. Proceeding to Cloud Run deployment."
    ;;
  * )
    echo "❌ Invalid input. Exiting."
    exit 1
    ;;
esac

# Deploy latest image to cloud run
echo
echo "🚀  STARTING: Deployment to Cloud Run"
echo

gcloud run deploy ${CRUN_SERVICE} \
  --image us-central1-docker.pkg.dev/${PROJECT_ID}/${CRUN_CONTAINER_REPO}/${CRUN_IMAGE} \
  --concurrency 2 \
  --min-instances 1 \
  --max-instances 1 \
  --set-env-vars "SSO_CLIENT_ID=${SSO_CLIENT_ID},SSO_CLIENT_SECRET=${SSO_CLIENT_SECRET},SSO_REDIRECT_URI=${SSO_REDIRECT_URI},SSO_SESSION_SECRET_KEY=${SSO_SESSION_SECRET_KEY},GOOGLE_API_KEY=${GOOGLE_API_KEY}" \
  --platform managed \
  --execution-environment gen2 \
  --cpu 1.0 \
  --memory 512Mi \
  --cpu-boost \
  --timeout 10m \
  --no-allow-unauthenticated \
  --region ${PROJECT_DEFAULT_LOCATION} \
  --project=${PROJECT_ID} \
  --service-account=${CRUN_SERVICE_ACCOUNT}

echo "✅ SUCCESS: Deployment to Cloud Run successfully"