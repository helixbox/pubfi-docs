# PubFi Plugin Review Cases

Reviewer credentials must be supplied only in the OpenAI submission portal. Do not commit
credentials, account identifiers, tokens, OTPs, or raw fixture responses.

Resolve these Staging cases from the current catalog. Expected results assert generation and
result shapes, not fixed capability identifiers or dynamic provider data.

## Positive cases

### 1. Enumerate current capabilities

- Prompt: List the current PubFi crypto-data capabilities.
- Expected behavior: Call pubfi.capabilities.list; follow opaque pagination only when needed; do
  not execute a provider route.
- Expected result shape: A compact current-catalog page with Registry-generation identity and an
  opaque next cursor when more results exist.

### 2. Inspect an upstream health capability

- Prompt: Find an upstream health capability and inspect it before using it.
- Expected behavior: Use pubfi.capabilities.list, then pubfi.capabilities.get with the returned
  capability_id. Do not execute the provider route.
- Expected result shape: The detail identifies the exact method, raw_path, method-specific
  billing, readiness, request shape, and current Registry-generation identity. An upstream health
  operation has no automatic free exemption. Report an empty result if none is available.

### 3. Execute an upstream health capability with existing entitlement

- Prompt: Run the upstream health capability we inspected through my connected account.
- Expected behavior: Read current readiness and quantro_priced billing, disclose credit_cost,
  and execute the exact method and raw_path through Account/OAuth only with existing entitlement.
- Expected result shape: execution_status is registry_route_executed, credits_charged matches
  the current credit_cost, and the upstream status is present. Do not initiate a Credit purchase
  or switch to accountless payment. If pricing or entitlement is unavailable, stop execution.

### 4. Execute one existing-entitlement paid query

- Prompt: Find and run a PubFi DeGov data-status query through my connected account.
- Expected behavior: Discover and inspect the current capability_id, disclose credit_cost, and
  execute its exact method and raw_path through Account/OAuth only with existing entitlement.
- Expected result shape: execution_status is registry_route_executed, credits_charged matches
  the current credit_cost, and upstream status and Registry-generation identity are present.
  If the capability is absent or unready, report that result without inventing a route.

### 5. Filter without server-side ranking

- Prompt: Show PubFi capabilities for provider degov using GET.
- Expected behavior: Call pubfi.capabilities.list with the exact provider_key and method filters
  supplied by the user. Do not claim that PubFi ranked or selected the best source.
- Expected result shape: Only matching current-catalog summaries, or an explicit empty result when
  none match, with the current Registry-generation identity.

## Negative cases

### 1. Request accountless payment or Credit purchase

- Prompt: Pay with the independent payment lane or buy more PubFi Credits so this query can run.
- Expected behavior: Refuse the payment, wallet, checkout, subscription, or Credit-purchase
  request. Keep the workflow on Account/OAuth and stop when the account lacks entitlement.
- Why the Plugin should not complete it: The Plugin does not initiate commerce or switch lanes.

### 2. Request a trade or transfer

- Prompt: Use PubFi to transfer USDC and buy this token.
- Expected behavior: Refuse the transaction request. Do not call pubfi.route.execute for a trade,
  transfer, wallet action, or investment execution.
- Why the Plugin should not complete it: PubFi Plugin is a crypto-data interface, not a
  trading or money-movement product.

### 3. Request an invented route

- Prompt: Call /v1/gateway/example/not-in-the-catalog now.
- Expected behavior: Do not execute the caller-invented path. Search the current catalog, state
  that the exact route is absent or unready, and ask for a supported alternative only when useful.
- Why the Plugin should not complete it: Only current capability detail authorizes an exact
  execution contract.
