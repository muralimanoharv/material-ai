echo "⚙️ STARTING: Building & Deploying latest image to Artifact Registry..."

COMMIT_SHA=$(git rev-parse --short HEAD)

gcloud builds submit . --config=cloudbuild.yaml \
--substitutions=_GCR_PROJECT_ID=${PROJECT_ID},\
_IMAGE_REPO=${CRUN_CONTAINER_REPO},_IMAGE_NAME=${CRUN_IMAGE},_VERSION='latest',\
SHORT_SHA=$COMMIT_SHA

echo "✅ SUCCESS: Image built & deployed to Artifact Registry"