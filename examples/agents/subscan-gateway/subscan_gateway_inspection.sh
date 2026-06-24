#!/usr/bin/env sh
set -eu

PUBFI_API_BASE="${PUBFI_API_BASE:-https://api.pubfi.ai}"
PUBFI_NETWORK="${PUBFI_NETWORK:-polkadot}"

if [ -z "${PROD_PUBFI_API_KEY:-}" ]; then
  echo "Set PROD_PUBFI_API_KEY before calling the live gateway." >&2
  exit 2
fi

curl -sS "${PUBFI_API_BASE}/v1/gateway/subscan/${PUBFI_NETWORK}/api/now" \
  --header "Authorization: Bearer ${PROD_PUBFI_API_KEY}"
