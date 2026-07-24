# Examples

This directory contains public-safe runnable examples for agent and API workflows.

Current examples:

- [PubFi Route Tools MCP](agents/pubfi-route-tools-mcp/README.md): dependency-free stdio bridge and
  Registry v2 smoke for the hosted MCP endpoint. It has a no-secret smoke mode.
- [Registry Catalog Curl](agents/capability-curl/README.md): no-auth inspection of the current
  Registry v2 catalog.
- [Accountless x402](agents/x402-base-sepolia/README.md): no-secret inspection of the current x402
  challenge without signing or spending test USDC.

Public examples must not include upstream provider keys, PubFi API keys, account identifiers,
private wallet data, raw production payloads, or unredacted readbacks.

Recommended example pattern:

1. explain the agent task;
2. inspect the current Registry catalog or tool schema;
3. identify whether the example uses public inspection, API-key execution, or accountless x402;
4. load any required API key or wallet key from a local secret store;
5. show a redacted response shape;
6. link to the canonical docs page for deeper context.
