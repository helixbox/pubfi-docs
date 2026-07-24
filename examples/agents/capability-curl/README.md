# Registry Catalog Curl Example

This no-secret example fetches the current signed Registry v2 catalog over HTTPS.

Use it before you construct an HTTP gateway request or wire an MCP client. Do not infer execution
from a Discovery page, old example, or provider name.

## Run

From the repository root:

```sh
sh examples/agents/capability-curl/inspect_registry.sh
```

To inspect another PubFi environment that you are authorized to use:

```sh
export PUBFI_API_BASE='https://api.pubfi.ai'
sh examples/agents/capability-curl/inspect_registry.sh
```

The response uses `pubfi.gateway.registry.catalog.v2`. Select only a current `ready` operation and
use its exact matcher and HTTP method. Refresh
[`https://api.pubfi.ai/openapi.json`](https://api.pubfi.ai/openapi.json) before you construct an
execution request because a new signed generation can change the route set.

This example does not call a provider, consume an account allocation, or create an x402 payment
challenge. See the [Quickstart](../../../getting-started/quickstart.md) for API-key execution and
the [Accountless x402 guide](../../../getting-started/x402.md) for the separate payment mode.

Do not commit API keys, wallet keys, payment signatures, raw account responses, or production
readbacks to this repository.
