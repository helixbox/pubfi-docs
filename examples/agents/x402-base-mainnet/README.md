# x402 Base mainnet Production HTTP And MCP

This Production-only example can inspect PubFi's accountless x402 challenge or run one bounded paid
request through the official HTTP or MCP client. It accepts only `https://api.pubfi.ai` and
`https://mcp.pubfi.ai`. Paid commands spend real USDC on Base mainnet.

## Inspect Without A Wallet

```sh
sh examples/agents/x402-base-mainnet/show_challenge.sh
```

The default resource is:

```text
https://api.pubfi.ai/v1/gateway/quantro/health
```

First inspect the live Production catalog. The catalog must list the exact route as ready. If that
route has x402 enabled, an eligible unpaid request returns HTTP `402`, a `PAYMENT-REQUIRED` header,
a JSON payment requirement, and `Cache-Control: private, no-store`. Treat that live challenge as
the authority for all payment terms.

## Install The Pinned Clients

```sh
cd examples/agents/x402-base-mainnet
npm ci
npm run check
```

The example pins the same official client versions used by PubFi's deployment acceptance.

## Approve The Payment Boundary

Read the unsigned challenge first. The example accepts only this pinned policy:

| Field | Required value |
| --- | --- |
| Resource | `https://api.pubfi.ai/v1/gateway/quantro/health` |
| Network | Base mainnet `eip155:8453` |
| Asset | canonical Base USDC `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913` |
| Amount | `1000` atomic units, or 0.001 USDC |
| Payee | `0x35764549c387f6befcbe6d03e6bfbd7ade4543b6` |
| Transfer | EIP-3009 |
| Maximum authorization lifetime | 300 seconds |

Inject `X402_BUYER_PRIVATE_KEY` into the command process with your wallet or secret manager. Do not
put the value in this repository, a `.env` file, a prompt, shell history, or command output.

## Run One Paid HTTP Request

```sh
npm run paid:http
```

The script requires one unsigned `402`, sends one authorization with `@x402/fetch`, requires
`PAYMENT-RESPONSE`, and verifies an exact response replay.

## Run One Paid MCP Tool Call

```sh
npm run paid:mcp
```

The script uses `@x402/mcp` with `pubfi.route.execute`. It verifies the Ed25519 `did:web` signed
offer and receipt, then verifies exact structured-content and payment-response replay.

Each paid command requires the exact 0.001 USDC offer and rejects an authorization lifetime above
300 seconds. Running both commands spends 0.002 USDC if both requests settle.

## Safety Rules

- This is Base mainnet and uses real-value USDC.
- This example rejects Staging API and MCP origins.
- Do not add a PubFi API key to an x402 request.
- Do not place a buyer private key, `PAYMENT-SIGNATURE`, or `PAYMENT-RESPONSE` in source, logs, or
  prompts.
- Use the live challenge for current terms, but compare its network, asset, payee, amount, and
  lifetime with an independently approved wallet policy before signing.
- Use a dedicated wallet with only the Base mainnet USDC needed for the run.

## Acceptance Evidence

The [Production acceptance run](https://github.com/helixbox/pubfi-mono/actions/runs/30259030111)
completed on 2026-07-27:

| Lane | Base transaction | Result |
| --- | --- | --- |
| HTTP | [`0xb011351c…cc594f`](https://basescan.org/tx/0xb011351c24f40b597778ec1dd79807d2a4a01950ae219db3299f0c51f2cc594f) | `402` challenge, paid `200`, verified signed offer and receipt, exact replay |
| MCP | [`0x25819c48…3f9934`](https://basescan.org/tx/0x25819c481c83ddc7dd028a8c3c6832ee7ba77a00b3b7300106bb6db5e73f9934) | paid tool result, verified signed offer and receipt, exact structured-content and payment-metadata replay |

The run used `@x402/core@2.19.0`, `@x402/mcp@2.19.0`, and
`@modelcontextprotocol/sdk@1.29.0`. Each request settled once for 0.001 USDC. The public evidence
does not include the buyer private key, `PAYMENT-SIGNATURE`, or full `PAYMENT-RESPONSE`.

See [Accountless x402](https://docs.pubfi.ai/getting-started/x402) for the complete payment and
credential boundary.
