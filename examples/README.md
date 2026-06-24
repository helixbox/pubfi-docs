# Examples

This directory contains public-safe runnable examples for agent and API workflows.

Current examples:

- [PubFi Route Tools MCP](agents/pubfi-route-tools-mcp/README.md): dependency-free stdio bridge and
  smoke for the hosted MCP endpoint. It has a no-secret smoke mode.
- [Capability Curl](agents/capability-curl/README.md): minimal HTTPS call to the capability
  runtime.
- [Provider Gateway Inspection](agents/subscan-gateway/README.md): lower-level gateway inspection
  using Subscan as one concrete provider example.

Public examples must not include upstream provider keys, PubFi API keys, account identifiers,
private wallet data, raw production payloads, or unredacted readbacks.

Recommended example pattern:

1. explain the agent task;
2. list required public dependencies;
3. load the PubFi API key from a local secret store or environment variable;
4. call PubFi through the public API or MCP endpoint;
5. show a redacted response shape;
6. link to the canonical docs page for deeper context.
