#!/usr/bin/env sh
set -eu

PUBFI_API_BASE="${PUBFI_API_BASE:-https://api.pubfi.ai}"

curl --silent --show-error "${PUBFI_API_BASE}/v1/capabilities"
