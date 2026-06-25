# Quickstart

This quickstart shows how to orient around PubFi's public docs, Discovery surfaces, and agent
interfaces.

## 1. Read The Public Index

Start with:

```text
https://pubfi.ai/discovery
https://pubfi.ai/llms.txt
https://pubfi.ai/llms-full.txt
https://docs.pubfi.ai/reference/agent-interface
```

Use Discovery to understand source categories, chains, providers, comparison pages, topic pages,
and public claim-safe readiness.

## 2. Inspect API And MCP Schemas

Open:

```text
https://api.pubfi.ai/reference
https://api.pubfi.ai/openapi.json
https://mcp.pubfi.ai/.well-known/mcp.json
```

The API reference is the interactive HTTP reference. The OpenAPI schema is the machine-readable
HTTP contract source. The MCP manifest is the agent-tool discovery surface.

## 3. Choose The Right Path

| Need | Path |
| --- | --- |
| Compare crypto data providers | Discovery pages |
| Let an agent inspect available data | `pubfi.capabilities.search` |
| Turn a data need into a route | `pubfi.route.plan` |
| Understand why a route was selected or rejected | `pubfi.route.explain` |
| Inspect input/output shape | `pubfi.schema.get` |
| Estimate cost posture | `pubfi.pricing.quote` |
| Execute a supported route | `pubfi.route.execute` with PubFi API-key auth and planning evidence |

## 4. Keep Secrets Out Of Prompts

PubFi API keys belong in a secret store or environment variable. Upstream provider keys stay
server-side and must not be sent by agents.

## 5. Check Readiness Before Execution

Do not treat a source page, schema, or route plan as proof of live execution. Live execution also
requires PubFi API-key auth, credits, provider readiness, credential configuration, source
freshness evidence, and a supported callable route.

## Next

- [API reference](/reference/api-reference)
- [MCP client setup](/getting-started/mcp-client)
- [Capability contracts](/concepts/capability-contracts)
- [Readiness and claim safety](/concepts/readiness-and-claim-safety)
- [Public examples](https://github.com/helixbox/pubfi-docs/tree/main/examples)
