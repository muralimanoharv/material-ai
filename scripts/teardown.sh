#!/bin/bash
set -e

echo "🚀 STARTING: Teardown...."

source ./setup.sh

# Delete Cloudrun
gcloud run services delete ${CRUN_SERVICE} --region="${PROJECT_DEFAULT_LOCATION}"


# Delete Artifact Registry & corresponding images 
gcloud artifacts repositories delete ${CRUN_CONTAINER_REPO} \
    --location=${PROJECT_DEFAULT_LOCATION}

# Delete service account
gcloud iam service-accounts delete ${CRUN_SERVICE_ACCOUNT}