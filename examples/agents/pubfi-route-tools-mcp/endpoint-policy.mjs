const endpoints = new Map([
  ["https://mcp.pubfi.ai", "PROD_PUBFI_API_KEY"],
  ["https://mcp.pubfi.ai/", "PROD_PUBFI_API_KEY"],
  ["https://mcp-stg.pubfi.ai", "STG_PUBFI_API_KEY"],
  ["https://mcp-stg.pubfi.ai/", "STG_PUBFI_API_KEY"]
]);

export function normalizePubfiMcpEndpoint(raw) {
  if (typeof raw !== "string" || !endpoints.has(raw)) {
    throw new Error(
      "PUBFI_MCP_ENDPOINT must be an exact PubFi MCP root: " +
        "https://mcp.pubfi.ai or https://mcp-stg.pubfi.ai."
    );
  }

  return new URL(raw).origin;
}

export function apiKeyEnvNameForEndpoint(raw) {
  const normalized = normalizePubfiMcpEndpoint(raw);

  return normalized === "https://mcp-stg.pubfi.ai"
    ? "STG_PUBFI_API_KEY"
    : "PROD_PUBFI_API_KEY";
}

export function rustMcpRequestInit(message, apiKey) {
  const headers = {
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
    "mcp-protocol-version": "2025-11-25"
  };

  if (apiKey) {
    headers.authorization = `Bearer ${apiKey}`;
  }

  return {
    method: "POST",
    headers,
    body: JSON.stringify(message),
    redirect: "error"
  };
}
