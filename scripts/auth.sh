#!/bin/bash

check_and_update_auth() {
  echo "Checking gcloud authentication status..."

  # Check both Standard Auth AND Application Default Credentials (ADC).
  # If EITHER fails (!), execute the login.
  if ! gcloud auth print-access-token >/dev/null 2>&1 || \
     ! gcloud auth application-default print-access-token >/dev/null 2>&1; then

    echo "⚠️  Credentials expired or missing. Refreshing both CLI and ADC..."
    
    # This command sets up standard auth AND generates the ADC JSON file in one step.
    gcloud auth login --update-adc
    
  else
    echo "✅  gcloud auth and ADC are both active."
  fi
}

# Run the check
check_and_update_auth