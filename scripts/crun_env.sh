# CLOUD RUN DEPLOYMENT VARIABLES
export CRUN_SERVICE_ACCOUNT_NAME="material-ai-crun-sa-01"
export CRUN_SERVICE_ACCOUNT="${CRUN_SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
export CRUN_SERVICE="material-ai-crun"
export CRUN_CONTAINER_REPO="material-ai-crun-repository"
export CRUN_IMAGE="material-ai"