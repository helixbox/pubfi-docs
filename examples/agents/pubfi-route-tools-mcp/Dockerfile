FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53

WORKDIR /app

COPY server.ts bridge-response.ts endpoint-policy.ts json.ts ./

ENV PUBFI_MCP_ENDPOINT=https://mcp.pubfi.ai

CMD ["node", "server.ts"]
