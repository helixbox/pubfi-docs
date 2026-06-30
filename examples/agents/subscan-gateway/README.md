# Provider Gateway Inspection: Subscan Example

This example shows the lower-level PubFi gateway path using Subscan-backed data as one concrete
provider sample.

PubFi is an aggregation layer, not a Subscan-specific wrapper. Subscan appears here only because a
provider-specific example needs a real route shape. The primary product path for repeated agent
workflows is PubFi capabilities and route planning across available providers.

Prefer capability routes for repeated product workflows. Use gateway routes when inspecting the
provider adapter shape, debugging source behavior, or building a new capability mapping.

## Current Route Shape

```text
https://api.pubfi.ai/v1/gateway/subscan/{network}/{endpoint...}
```

Examples:

- `GET /v1/gateway/subscan/polkadot/api/now`
- `POST /v1/gateway/subscan/polkadot/api/v2/scan/accounts`
- `POST /v1/gateway/subscan/polkadot/api/scan/account/tokens`
- `POST /v1/gateway/subscan/acala/api/scan/account/tokens`

## Run

```sh
export PROD_PUBFI_API_KEY='<PubFi API key>'
export PUBFI_NETWORK='polkadot'
sh examples/agents/subscan-gateway/subscan_gateway_inspection.sh
```

The script calls the public gateway through PubFi. It does not accept a Subscan key from the
client; provider credentials are server-side.

## Safety

- Do not use the retired `https://pubfi.ai/api/gateway/...` path.
- Do not send upstream Subscan keys from an agent client.
- Do not log PubFi API keys.
- Do not treat a gateway route as a stable public capability when a PubFi capability exists.
