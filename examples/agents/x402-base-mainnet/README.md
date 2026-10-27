# x402 Base Mainnet Production Archive

This directory retains historical HTTP and MCP client source. The former pinned route is retired,
so both paid commands are disabled. They are not a current Production payment example.

## Inspect A Current Challenge

Select a current `ready` GET operation whose billing mode is `priced` from the Production catalog.
Confirm that x402 is enabled for the selected method. Set its exact resource and inspect the
unsigned challenge without a wallet:

```sh
export X402_RESOURCE_URL='https://api.pubfi.ai<exact ready priced GET path>'
sh examples/agents/x402-base-mainnet/show_challenge.sh
```

The live challenge supplies the payment terms. An upstream health path does not imply free access;
PubFi's own service health endpoints remain public and free.

A Production payment uses real Base mainnet USDC. Before signing, validate the exact resource,
network, asset, payee, amount, and authorization lifetime against an independently approved wallet
policy. Use a dedicated Production wallet and do not reuse Staging credentials.

See [Accountless x402](https://docs.pubfi.ai/getting-started/x402) for the complete payment and
credential boundary.
