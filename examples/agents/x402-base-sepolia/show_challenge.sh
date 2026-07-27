#!/usr/bin/env sh
set -eu

PUBFI_X402_RESOURCE_URL="${PUBFI_X402_RESOURCE_URL:-https://api-stg.pubfi.ai/v1/gateway/quantro/health}"

case "${PUBFI_X402_RESOURCE_URL}" in
  https://api-stg.pubfi.ai/v1/gateway/*)
    ;;
  *)
    echo "PUBFI_X402_RESOURCE_URL must use the exact PubFi Staging gateway HTTPS origin." >&2
    exit 2
    ;;
esac

curl --silent --show-error --include "${PUBFI_X402_RESOURCE_URL}"
