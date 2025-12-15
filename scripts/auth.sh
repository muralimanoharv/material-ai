#!/bin/bash
set -e

# Function to check Standard User Auth
check_gcloud_auth() {
  echo "Checking gcloud auth status..."
  # Try to print an access token. Output is silenced.
  if ! gcloud auth print-access-token >/dev/null 2>&1; then
    echo "⚠️  Auth credentials expired or missing. Logging in..."
    gcloud auth login
  else
    echo "✅  gcloud auth is active."
  fi
}

# Function to check Application Default Credentials (ADC)
check_adc_auth() {
  echo "Checking Application Default Credentials..."
  # Try to print an ADC token. Output is silenced.
  if ! gcloud auth application-default print-access-token >/dev/null 2>&1; then
    echo "⚠️  ADC expired or missing. Logging in..."
    gcloud auth application-default login
  else
    echo "✅  ADC is active."
  fi
}

# Run the checks
check_gcloud_auth
check_adc_auth