import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const MAX_CONTENT_ITEMS = 128;
const MAX_PAYMENT_OPTIONS = 32;
const MAX_ERROR_TEXT_LENGTH = 1024 * 1024;
const MAX_VALIDATION_NODES = 4096;

function limitArray(value, limit) {
  if (Array.isArray(value) && value.length > limit) {
    throw new Error('MCP response exceeds the public example limit');
  }
}

function limitPaymentOptions(value) {
  limitArray(value?.accepts, MAX_PAYMENT_OPTIONS);
}

function limitValidationArrays(value) {
  const pending = [value];
  let nodes = 0;
  while (pending.length > 0) {
    const current = pending.pop();
    nodes += 1;
    if (nodes > MAX_VALIDATION_NODES) {
      throw new Error('MCP response exceeds the public example limit');
    }
    if (current && typeof current === 'object') {
      limitArray(current, MAX_CONTENT_ITEMS);
      for (const child of Object.values(current)) {
        if (nodes + pending.length >= MAX_VALIDATION_NODES) {
          throw new Error('MCP response exceeds the public example limit');
        }
        pending.push(child);
      }
    }
  }
  return value;
}

function checkToolResult(value) {
  limitValidationArrays(value?.content);
  if (value?.isError) {
    limitPaymentOptions(value.structuredContent);
    const text = value.content?.[0]?.text;
    if (typeof text === 'string') {
      if (text.length > MAX_ERROR_TEXT_LENGTH) {
        throw new Error('MCP error response exceeds the public example limit');
      }
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        // The MCP error content need not be JSON.
      }
      limitPaymentOptions(parsed);
    }
  }
  return value;
}

export class BoundedMCPClient extends Client {
  request(request, resultSchema, options) {
    if (request.method === 'initialize') {
      resultSchema = z.preprocess(limitValidationArrays, resultSchema);
    }
    return super.request(request, resultSchema, options);
  }

  async callTool(params, resultSchema = CallToolResultSchema, options) {
    try {
      const result = await super.callTool(
        params,
        z.preprocess(checkToolResult, resultSchema),
        options,
      );
      if (params._meta?.['x402/payment'] && !this.firstPaidResult) {
        this.firstPaidResult = result;
      }
      return result;
    } catch (error) {
      limitPaymentOptions(error?.data?.x402 ?? error?.data);
      throw error;
    }
  }
}
