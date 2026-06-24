#!/usr/bin/env sh
set -eu

PUBFI_API_BASE="${PUBFI_API_BASE:-https://api.pubfi.ai}"
PUBFI_NETWORK="${PUBFI_NETWORK:-polkadot}"

if [ -z "${PROD_PUBFI_API_KEY:-}" ]; then
  echo "Set PROD_PUBFI_API_KEY before calling the live capability runtime." >&2
  exit 2
fi

if [ -z "${PUBFI_WALLET_ADDRESS:-}" ]; then
  echo "Set PUBFI_WALLET_ADDRESS to the wallet or account address you want to query." >&2
  exit 2
fi

curl -sS "${PUBFI_API_BASE}/v1/capabilities/wallet.account_balance" \
  --header "Authorization: Bearer ${PROD_PUBFI_API_KEY}" \
  --header "Content-Type: application/json" \
  --data "{
    \"wallet_address\": \"${PUBFI_WALLET_ADDRESS}\",
    \"network\": \"${PUBFI_NETWORK}\"
  }"
