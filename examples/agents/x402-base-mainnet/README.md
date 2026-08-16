# x402 Base mainnet Production HTTP And MCP

This archive records the Production route and payment policy accepted on 2026-07-27. The current
schema v5 contract classifies exact health operations as `free_health`, so this pinned health route
is not a current x402 payment target. Do not run the archived paid commands. Select a current ready
non-health `quantro_priced` operation and approve a new bounded Base mainnet policy before making a
Production payment.

## Inspect Without A Wallet

```sh
sh examples/agents/x402-base-mainnet/show_challenge.sh
```

The default resource is:

```text
https://api.pubfi.ai/v1/gateway/quantro/health
```

The command is retained only to inspect the historical resource. A current exact health operation
returns through the free-health lane, not a payment challenge. The historical acceptance below does
not authorize a payment.

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

## Archived Paid Commands

`paid:http` and `paid:mcp` reproduce the former pinned policy in source, but they are not current
run instructions. Do not execute them. The current operation-level catalog and unsigned challenge
must drive any new client policy.

## Safety Rules

- This is Base mainnet and uses real-value USDC.
- This example rejects Staging API and MCP origins.
- Its archived MCP command uses the explicit `https://mcp.pubfi.ai/x402` endpoint.
- Do not add a PubFi API key to an x402 request.
- Do not place a buyer private key, `PAYMENT-SIGNATURE`, or `PAYMENT-RESPONSE` in source, logs, or
  prompts.
- Use the live challenge for current terms, but compare its network, asset, payee, amount, and
  lifetime with an independently approved wallet policy before signing.
- Use a dedicated wallet with only the Base mainnet USDC needed for the run.
- Do not reuse a Staging wallet, private key, or payment authorization for this Production example.

## Acceptance Evidence

The [Production acceptance run](https://github.com/helixbox/pubfi-mono/actions/runs/30259030111)
completed on 2026-07-27. The workflow link requires access to the source repository; the Base
transactions below are public:

| Lane | Base transaction | Result |
| --- | --- | --- |
| HTTP | [`0xb011351c…cc594f`](https://basescan.org/tx/0xb011351c24f40b597778ec1dd79807d2a4a01950ae219db3299f0c51f2cc594f) | `402` challenge, paid `200`, verified signed offer and receipt, exact replay |
| MCP | [`0x25819c48…3f9934`](https://basescan.org/tx/0x25819c481c83ddc7dd028a8c3c6832ee7ba77a00b3b7300106bb6db5e73f9934) | paid tool result, verified signed offer and receipt, exact structured-content and payment-metadata replay |

The run used `@x402/core@2.19.0`, `@x402/mcp@2.19.0`, and
`@modelcontextprotocol/sdk@1.29.0`. Each request settled once for 0.001 USDC. The public evidence
does not include the buyer private key, `PAYMENT-SIGNATURE`, or full `PAYMENT-RESPONSE`.

A bounded Quantro read-only acceptance confirmed one `settled` settlement and one signed receipt
for each lane. Exact replay reused them without another charge. The underlying Quantro records
remain private.

See [Accountless x402](https://docs.pubfi.ai/getting-started/x402) for the complete payment and
credential boundary.
