# PubFi Plugin Review Cases

Reviewer credentials must be supplied only in the OpenAI submission portal. Do not commit
credentials, account identifiers, tokens, OTPs, or raw fixture responses.

The Staging fixtures below are stable for Registry generation sequence 47. Expected results assert
generation and result shapes, not dynamic provider data.

## Positive cases

### 1. Enumerate current capabilities

- Prompt: List the current PubFi crypto-data capabilities.
- Expected behavior: Call pubfi.capabilities.list; follow opaque pagination only when needed; do
  not execute a provider route.
- Expected result shape: A compact current-catalog page with Registry-generation identity and an
  opaque next cursor when more results exist.

### 2. Inspect the health capability

- Prompt: Inspect capability route-f39f3795eb94457fd48bae32811d4da1da9e62b24f066578136ba00dacf70d57
  before using it.
- Expected behavior: Call pubfi.capabilities.get with that exact current capability identifier.
- Expected result shape: The detail identifies GET /v1/gateway/degov/global/health, a
  free_health billing mode, readiness, request shape, and current Registry-generation identity.
  Do not execute the provider route.

### 3. Execute the free health capability

- Prompt: Run the current PubFi health capability and show me the result.
- Expected behavior: Inspect the exact health capability first, then execute only GET
  /v1/gateway/degov/global/health through Account/OAuth.
- Expected result shape: execution_status is free_health_executed, billing.mode is free_health,
  the upstream status is present, and no Credit or payment action is initiated.

### 4. Execute one existing-entitlement paid query

- Prompt: Run the PubFi DeGov data-status capability through my connected account.
- Expected behavior: Inspect capability
  route-3d4fa0587ffa237d7a4bcd555bc406e3387c825a058c3e0f9b315ed4dbf632b0, disclose credit_cost: 1,
  and execute only its exact GET /v1/gateway/degov/global/v2/meta/data-status contract through
  Account/OAuth when the account has the required entitlement.
- Expected result shape: execution_status is registry_route_executed, credits_charged is 1,
  upstream status is present, and the current Registry-generation identity is present.

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
