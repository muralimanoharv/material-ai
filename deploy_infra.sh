ENVIRONMENT=$1
echo "STARTING: Deployment...."

source ./setup.sh

# Create Docker Repository
echo "STARTING: Creating Artifact Registry..."

gcloud artifacts repositories create ${CRUN_CONTAINER_REPO} \
    --repository-format=docker \
    --location=${PROJECT_DEFAULT_LOCATION} \
    --description="Repo for Cloud run docker images" \

echo "SUCCESS: Artifact Registry created successfully"

source ./cloudbuild.sh

# Deploy latest image to cloud run
echo "STARTING: Deployment to Cloud Run"

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

echo "SUCCESS: Deployment to Cloud Run successfully"