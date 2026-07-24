#!/usr/bin/env sh
set -eu

PUBFI_X402_RESOURCE_URL="${PUBFI_X402_RESOURCE_URL:-https://api.pubfi.ai/v1/gateway/quantro/health}"

case "${PUBFI_X402_RESOURCE_URL}" in
  https://api.pubfi.ai/v1/gateway/* | https://api-stg.pubfi.ai/v1/gateway/*)
    ;;
  *)
    echo "PUBFI_X402_RESOURCE_URL must be an exact PubFi gateway HTTPS URL." >&2
    exit 2
    ;;
esac

curl --silent --show-error --include "${PUBFI_X402_RESOURCE_URL}"
