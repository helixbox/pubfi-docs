# Runtime Endpoints

This page lists public runtime endpoint families and their documentation roles.

## API Host

```text
https://api.pubfi.ai
```

Public endpoint families:

- `/healthz`
- `/readyz`
- `/version`
- `/openapi.json`
- `/reference`
- `/v1/capabilities`
- `/v1/capabilities/{capability_id}`
- `/v1/gateway/...`
- `/v1/api-keys`
- `/v1/account/...`

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
- `/docs`
- `/llms.txt`
- `/llms-full.txt`
- `/.well-known/mcp.json`

## Docs Rule

Public docs can point to endpoint families and schemas. They should not publish private env vars,
database URLs, credentials, raw account data, usage rows, or provider keys.
