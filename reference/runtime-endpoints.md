# Runtime Endpoints

This page lists public runtime endpoint families and their documentation roles.

## API Host

```text
https://api.pubfi.ai
```

Public endpoint families:

- `/healthz`
- `/readyz`
- `/`
- `/.well-known/mcp.json`
- `/version`
- `/openapi.json`
- `/reference`
- `/v1/capabilities`
- `/v1/capabilities/{capability_id}`
- `/v1/gateway/...`
- `/v1/api-keys`
- `/v1/account/...`

The API host also exposes a root MCP JSON-RPC endpoint and MCP discovery manifest for runtime
clients that discover capabilities through the API OpenAPI surface. The hosted MCP client endpoint
remains `https://mcp.pubfi.ai`.

## MCP Host

```text
https://mcp.pubfi.ai
```

Public endpoint families:

- `/`
- `/healthz`
- `/readyz`
- `/.well-known/mcp.json`

## Web Host

```text
https://pubfi.ai
```

Public endpoint families:

- `/discovery`
- `/discovery.md`
- `/discovery/sources`
- `/discovery/sources/page/{page}`
- `/agents.md`
- `/llms.txt`
- `/llms-full.txt`
- `/discovery/agent-capabilities.json`
- `/openapi/degov-openapi.json`
- `/openapi/subscan-openapi.json`
- `/.well-known/mcp.json`
- `/.well-known/mcp/server-card.json`
- `/.well-known/mcp-registry-auth` (optional proof route; may return 404 when no proof is
  configured)

Legacy `pubfi.ai/docs/...` paths redirect to `https://docs.pubfi.ai`.

## Docs Rule

Public docs can point to endpoint families and schemas. They should not publish private env vars,
database URLs, credentials, raw account data, usage rows, or provider keys.
