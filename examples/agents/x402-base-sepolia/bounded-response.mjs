const MAX_RESPONSE_BYTES = 1024 * 1024;

export async function boundedResponse(response) {
  const contentLength = response.headers.get('content-length');
  if (
    contentLength !== null &&
    (!/^\d+$/.test(contentLength) || BigInt(contentLength) > BigInt(MAX_RESPONSE_BYTES))
  ) {
    await response.body?.cancel();
    throw new Error('response exceeds the public example cap');
  }
  if (!response.body) return response;

  let bytes = 0;
  const body = response.body.pipeThrough(new TransformStream({
    transform(chunk, controller) {
      bytes += chunk.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) {
        throw new Error('response exceeds the public example cap');
      }
      controller.enqueue(chunk);
    },
  }));
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
