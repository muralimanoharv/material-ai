#!/bin/bash
set -e
echo "⚙️  STARTING: Building & Deploying latest image to Artifact Registry..."

COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null) || COMMIT_SHA=$(date -u +"%Y%m%dT%H%M%SZ")

gcloud builds submit . --config=cloudbuild.yaml \
--substitutions=_GCR_PROJECT_ID=${PROJECT_ID},\
_IMAGE_REPO=${CRUN_CONTAINER_REPO},_IMAGE_NAME=${CRUN_IMAGE},_VERSION='latest',\
SHORT_SHA=$COMMIT_SHA

echo "✅ SUCCESS: Image built & deployed to Artifact Registry"
echo