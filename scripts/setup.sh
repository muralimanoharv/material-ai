
#!/bin/bash

RED='\033[0;31m'
NC='\033[0m'

DEFAULT_PROJECT_ID=$(gcloud config get-value project)

# 1. Prompt the user for their Project ID
read -p "🚧 Enter your Google Cloud Project ID (default: ${DEFAULT_PROJECT_ID}): " PROJECT_ID

# 2. Validate that the input is not empty
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$DEFAULT_PROJECT_ID
fi

export PROJECT_ID=$PROJECT_ID
echo "✅ Using Project ID: $PROJECT_ID"


export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
echo "#️⃣  Using Project Number: $PROJECT_NUMBER"

if [ -z "$PROJECT_NUMBER" ]; then
    exit 1
fi
echo
read -p "🚧 Enter project location (default: us-central1): " PROJECT_LOCATION
export PROJECT_DEFAULT_LOCATION=${PROJECT_LOCATION:-us-central1}
echo "🌍 Using Project Location: $PROJECT_DEFAULT_LOCATION"
echo

# CLOUD RUN ENVIRONMENT VARIABLES
echo "⚙️  Configuring required environment variables..."
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "🟢 .env file loaded."
  echo
else
  echo -e "❌ ${RED}ERROR:${NC} .env file not found."
  exit 1
fi

source ./scripts/crun_env.sh

# Use Cloud Run URL for SSO Redirect URI
export SSO_REDIRECT_URI="https://${CRUN_SERVICE}-${PROJECT_NUMBER}.${PROJECT_DEFAULT_LOCATION}.run.app/auth"
echo "🔗 Using SSO Redirect URL: $SSO_REDIRECT_URI"
echo



