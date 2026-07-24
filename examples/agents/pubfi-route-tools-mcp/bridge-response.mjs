export function exactDirectMcpResponse(requestId, responseBody) {
  if (
    !responseBody ||
    typeof responseBody !== "object" ||
    responseBody.jsonrpc !== "2.0" ||
    responseBody.id !== requestId ||
    (responseBody.result === undefined) === (responseBody.error === undefined)
  ) {
    throw new Error("Rust MCP returned an invalid JSON-RPC response envelope.");
  }

  return responseBody;
}
