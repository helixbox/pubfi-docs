const endpoints = new Map([
  ["https://mcp.pubfi.ai", "PROD_PUBFI_API_KEY"],
  ["https://mcp.pubfi.ai/", "PROD_PUBFI_API_KEY"],
  ["https://mcp-stg.pubfi.ai", "STG_PUBFI_API_KEY"],
  ["https://mcp-stg.pubfi.ai/", "STG_PUBFI_API_KEY"]
]);
export const pubfiMcpProtocolVersion = "2026-07-28";

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
  if (
    !message ||
    typeof message !== "object" ||
    message.jsonrpc !== "2.0" ||
    !(typeof message.id === "string" || typeof message.id === "number") ||
    typeof message.method !== "string" ||
    !message.method ||
    !message.params ||
    typeof message.params !== "object" ||
    Array.isArray(message.params)
  ) {
    throw new Error("PubFi MCP stdio bridge accepts one modern JSON-RPC request object.");
  }
  const meta = message.params._meta;
  if (
    !meta ||
    typeof meta !== "object" ||
    Array.isArray(meta) ||
    meta["io.modelcontextprotocol/protocolVersion"] !== pubfiMcpProtocolVersion ||
    !meta["io.modelcontextprotocol/clientCapabilities"] ||
    typeof meta["io.modelcontextprotocol/clientCapabilities"] !== "object" ||
    Array.isArray(meta["io.modelcontextprotocol/clientCapabilities"])
  ) {
    throw new Error("PubFi MCP stdio bridge requires complete 2026-07-28 request metadata.");
  }
  const headers = {
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
    "mcp-protocol-version": pubfiMcpProtocolVersion,
    "mcp-method": message.method
  };
  const name =
    message.method === "resources/read"
      ? message.params.uri
      : ["tools/call", "prompts/get"].includes(message.method)
        ? message.params.name
        : undefined;

  if (typeof name === "string") {
    headers["mcp-name"] = encodeHeaderValue(name);
  }

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

function encodeHeaderValue(value) {
  const safe =
    /^[\x21-\x7e](?:[\x20-\x7e]*[\x21-\x7e])?$/.test(value) &&
    !(value.startsWith("=?base64?") && value.endsWith("?="));

  return safe ? value : `=?base64?${Buffer.from(value, "utf8").toString("base64")}?=`;
}
