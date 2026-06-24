# Capability Curl Example

This example calls the PubFi capability runtime directly over HTTPS.

Use it when you want a minimal API example before wiring an MCP client.

## Catalog Check

The public catalog does not require a PubFi API key:

```sh
curl -sS https://api.pubfi.ai/v1/capabilities
```

## Account Balance Runtime Call

Live account-balance execution requires:

- `PROD_PUBFI_API_KEY`;
- `PUBFI_WALLET_ADDRESS`;
- account credits;
- server-side provider credentials configured by PubFi;
- current provider readiness for the selected route.

Run:

```sh
export PROD_PUBFI_API_KEY='<PubFi API key>'
export PUBFI_WALLET_ADDRESS='<wallet address to query>'
export PUBFI_NETWORK='polkadot'
sh examples/agents/capability-curl/wallet_account_balance.sh
```

The response uses `pubfi.capability.response.v1` and includes readiness, provenance, source
freshness, warnings, and normalized data.

Do not commit API keys, wallet addresses, raw account responses, or production readbacks to this
repository.
