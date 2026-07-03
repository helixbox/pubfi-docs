FROM node:22-alpine

WORKDIR /app

COPY server.mjs ./server.mjs

ENV PUBFI_MCP_ENDPOINT=https://mcp.pubfi.ai

CMD ["node", "server.mjs"]
