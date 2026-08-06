# Registry Catalog Curl Example

This no-secret example fetches the current signed Registry v2 catalog over HTTPS.

Use it before you construct an HTTP gateway request or wire an MCP client. Do not infer execution
from a Discovery page, old example, or provider name.

## Run

From the repository root:

```sh
sh examples/agents/capability-curl/inspect_registry.sh
```

To inspect the public Staging catalog:

```sh
export PUBFI_API_BASE='https://api-stg.pubfi.ai'
sh examples/agents/capability-curl/inspect_registry.sh
```

The response uses the paginated `pubfi.gateway.registry.capability-page.v5` schema. Follow each
opaque `next_cursor`, then select only a current `ready` operation and use its exact matcher and
HTTP method. Inspect that method's `operations[].billing`: `quantro_priced` provides the current
Credits and x402 terms, `free_health` identifies a public exact health operation, and
`pricing_unavailable` cannot enter a paid lane. Refresh
the matching environment's OpenAPI before you construct an execution request because a new signed
generation can change the route set:

- Staging: [`https://api-stg.pubfi.ai/openapi.json`](https://api-stg.pubfi.ai/openapi.json)
- Production: [`https://api.pubfi.ai/openapi.json`](https://api.pubfi.ai/openapi.json)

This example does not call a provider, consume an account allocation, or create an x402 payment
challenge. See the [Quickstart](../../../getting-started/quickstart.md) for API-key execution and
the [Accountless x402 guide](../../../getting-started/x402.md) for the separate payment mode.
See the [Staging guide](../../../getting-started/staging.md) for the full Staging test flow.

Do not commit API keys, wallet keys, payment signatures, raw account responses, or production
readbacks to this repository.
