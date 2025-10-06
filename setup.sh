
#!/bin/bash
echo "Configuring required environment variables..."

# PROJECT PARAMETERS
export PROJECT_ID=""
export PROJECT_NUMBER=""
export CRS_PROJECT_ID=""
export PROJECT_DEFAULT_LOCATION=""

# CLOUD RUN ENVIRONMENT VARIABLES
# Check if the .env file exists
if [ -f .env ]; then
  # Use grep to filter out comments and empty lines, then xargs to export them
  export $(grep -v '^#' .env | xargs)
  echo ".env file loaded."
else
  echo "WARNING: .env file not found."
fi
export SSO_REDIRECT_URI=https://material-ai-245112325315.us-central1.run.app/auth


# CLOUD RUN DEPLOYMENT VARIABLES
export CRUN_SERVICE_ACCOUNT_NAME="${PROJECT_NUMBER}-compute"
export CRUN_SERVICE_ACCOUNT="${CRUN_SERVICE_ACCOUNT_NAME}@developer.gserviceaccount.com"

export CRUN_SERVICE="material-ai"
export CRUN_CONTAINER_REPO="material-ai-crun-repository"
export CRUN_IMAGE="material-ai"


