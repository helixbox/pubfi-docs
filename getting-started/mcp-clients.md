---
title: MCP Client Guides
description: Configure PubFi in popular desktop, IDE, CLI, local-model, and hosted agent clients.
---

This page gives client-specific setup for PubFi's hosted MCP endpoint. It covers the API-key
execution lane. Use [MCP Client Setup](/getting-started/mcp-client) for the protocol, tool, and
x402 contracts.

The Production examples use:

```text
https://mcp.pubfi.ai
```

For Staging, replace the endpoint with `https://mcp-stg.pubfi.ai` and replace
`PROD_PUBFI_API_KEY` with `STG_PUBFI_API_KEY`. Do not mix endpoints and keys.

## Before You Start

1. Create an environment-specific PubFi key as described in [API Key And
   Runtime](/getting-started/api-key-runtime).
2. Store the key in a secret manager, a client secure-input store, or an environment variable:

   ```sh
   export PROD_PUBFI_API_KEY='<Production PubFi API key>'
   ```

3. Keep the key out of prompts, source control, shared client configuration, screenshots, and
   logs.
4. Use the exact hosted MCP root. Do not append `/mcp`, `/sse`, or another path.

`PROD_PUBFI_API_KEY` is a local variable name for the client key issued to your account. It is not
a shared PubFi Production key and it is not a server-side hashing secret. Each user or agent owner
must supply and rotate their own issued key.

Public handshake, tool discovery, and capability reads work without a key. An API-key call to
`pubfi.route.execute` needs the configured header.

## What The Agent Will See

Every unrestricted client connection discovers the same three generic tools:

- `pubfi.capabilities.list`
- `pubfi.capabilities.get`
- `pubfi.route.execute`

Subscan and DeGov are provider filters and Registry data. They are not separate MCP tool
names. The agent must:

1. call `pubfi.capabilities.list` with exact `provider_key: "subscan"` or
   `provider_key: "degov"`;
2. select one current capability and call `pubfi.capabilities.get` with its exact
   `capability_id`; and
3. execute only the returned exact `raw_path` and `method`.

A client that reports no `subscan.*` or `degov.*` tools is working as designed.

## Client Coverage

| Client | Recommended connection | Key handling |
| --- | --- | --- |
| Codex CLI, Codex IDE, ChatGPT desktop | Direct Streamable HTTP | Bearer token environment variable |
| Claude Code | Direct Streamable HTTP | Environment variable in the header |
| VS Code with GitHub Copilot | Direct Streamable HTTP | Secure input variable |
| GitHub Copilot CLI | Direct Streamable HTTP | Environment variable in the header |
| GitHub Copilot coding agent | Direct Streamable HTTP | Repository Agents secret |
| Cursor IDE and Cursor Agent | Direct Streamable HTTP | Environment variable in the header |
| Devin CLI and Devin Local | Direct Streamable HTTP | Environment variable in a local config |
| Windsurf legacy Cascade | Direct Streamable HTTP | Environment or secret-file interpolation |
| Gemini CLI | Direct Streamable HTTP | Private user-level static header |
| Kiro IDE and Kiro CLI | Direct Streamable HTTP | Environment variable in the header |
| Amazon Q Developer IDE | Direct Streamable HTTP | Private global static header |
| Amazon Q Developer CLI | PubFi stdio bridge | Local-only environment or agent config |
| Continue | Direct Streamable HTTP | Continue local secret |
| Cline IDE and CLI | Direct Streamable HTTP | Private user-level static header |
| Roo Code | Direct Streamable HTTP | Private global static header |
| Zed | Direct Streamable HTTP | Private user setting |
| Raycast AI | Direct Streamable HTTP | Private HTTP-header field |
| LM Studio | Direct Streamable HTTP | Private user-level static header |
| OpenCode | Direct Streamable HTTP | Environment variable in the header |
| Warp local agents | Direct Streamable HTTP | Private personal static header |
| LibreChat | Direct Streamable HTTP | Per-user sensitive API-key field |
| Claude Desktop local MCP | PubFi stdio bridge | Local-only environment or client config |
| JetBrains AI Assistant | PubFi stdio bridge | Environment inherited by the IDE |
| goose Desktop and CLI | PubFi stdio bridge | Local environment or goose keyring |
| Cherry Studio | PubFi stdio bridge | Private local environment or client config |
| ChatGPT web custom app | Compatibility boundary | Current static key lane is not documented |
| Claude web custom connector | Compatibility boundary | Current static key lane is not documented |

Use an environment or secure-input reference when the client supports one. Some clients only
document static custom headers. For those clients, put the key only in the private user-level
configuration, disable settings sync for that entry, and never use a project or team file.
Rotate the key if that file is copied, logged, or shared.

The general clients on this page do not become x402 wallet clients by adding an MCP server. Use an
x402-aware client and [Accountless x402](/getting-started/x402) for accountless payment.

## Codex CLI, Codex IDE, And ChatGPT Desktop

Codex CLI, the Codex IDE extension, and the ChatGPT desktop app share
`~/.codex/config.toml` on the same Codex host. Add:

```toml
[mcp_servers.pubfi]
url = "https://mcp.pubfi.ai"
bearer_token_env_var = "PROD_PUBFI_API_KEY"
```

Start the client from an environment that contains `PROD_PUBFI_API_KEY`. Then:

- run `codex mcp list` in a terminal;
- use `/mcp` in the Codex terminal UI or ChatGPT desktop composer; or
- open **MCP servers** in the IDE extension and restart the extension.

See the official [Codex MCP guide](https://developers.openai.com/codex/mcp/).

## Claude Code

Add this entry to a project `.mcp.json` or the equivalent user-level configuration:

```json
{
  "mcpServers": {
    "pubfi": {
      "type": "http",
      "url": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer ${PROD_PUBFI_API_KEY}"
      }
    }
  }
}
```

Claude Code expands environment variables in HTTP headers. Run `claude mcp list`, then use
`/mcp` in Claude Code to check the connection. A project `.mcp.json` can be shared because the
example contains only an environment-variable reference, not the key.

See the official [Claude Code MCP guide](https://code.claude.com/docs/en/mcp).

## VS Code With GitHub Copilot

Open the user MCP configuration with **MCP: Open User Configuration**, or create
`.vscode/mcp.json`. Use a secure input:

```json
{
  "servers": {
    "pubfi": {
      "type": "http",
      "url": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer ${input:pubfi-production-api-key}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "pubfi-production-api-key",
      "description": "PubFi Production API key",
      "password": true
    }
  ]
}
```

VS Code prompts once and stores the input securely. Run **MCP: List Servers**, start `pubfi`, and
review the tool list. A VS Code MCP file uses the top-level `servers` key, not `mcpServers`.

See the official [VS Code MCP configuration
reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration).

## GitHub Copilot CLI

Add this entry to the private user file `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "pubfi": {
      "type": "http",
      "url": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer ${PROD_PUBFI_API_KEY}"
      },
      "tools": ["*"]
    }
  }
}
```

Copilot CLI expands environment variables in remote headers. Do not put the key in a shared
`.mcp.json` or `.github/mcp.json` file. Run `copilot mcp list` and `copilot mcp get pubfi`, or use
`/mcp show pubfi` in an interactive session. Copilot CLI does not read VS Code's
`.vscode/mcp.json`; the top-level keys are different.

See the official [GitHub Copilot CLI MCP
guide](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers)
and [CLI command
reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference).

## GitHub Copilot Coding Agent

Repository administrators can configure PubFi at **Settings → Copilot → MCP servers**. Create an
Agents secret named `COPILOT_MCP_PUBFI_API_KEY`, then start with this read-only configuration:

```json
{
  "mcpServers": {
    "pubfi": {
      "type": "http",
      "url": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer ${COPILOT_MCP_PUBFI_API_KEY}"
      },
      "tools": [
        "pubfi.capabilities.list",
        "pubfi.capabilities.get"
      ]
    }
  }
}
```

GitHub requires MCP secret and variable names to start with `COPILOT_MCP_`. The coding agent can
call enabled tools without an approval prompt. Add `pubfi.route.execute` to `tools` only after the
repository owner has reviewed PubFi account permissions, cost, and the routes that the agent may
execute. Never put the key value in the JSON.

See the official [Copilot coding agent MCP
guide](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/configure-mcp-servers).

## Cursor IDE And Cursor Agent

Add this entry to the user file `~/.cursor/mcp.json` or a project `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "pubfi": {
      "url": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer ${env:PROD_PUBFI_API_KEY}"
      }
    }
  }
}
```

Cursor resolves `${env:...}` when it starts. Make sure the Cursor process receives the
environment variable, then restart Cursor. For Cursor Agent, run:

```sh
cursor-agent mcp list
cursor-agent mcp list-tools pubfi
```

Cursor does not use VS Code's `inputs` array in `mcp.json`. See the official Cursor [MCP
guide](https://cursor.com/docs/mcp) and [Agent CLI
reference](https://cursor.com/docs/cli/reference/parameters), plus Cursor's current [secret
handling guidance](https://forum.cursor.com/t/secure-secret-handing-for-mcps/155638/4).

## Devin CLI And Devin Local

Use the gitignored local file `.devin/mcp_config.local.json` for a project-specific key, or the
user file `~/.config/devin/mcp_config.json`:

```json
{
  "mcpServers": {
    "pubfi": {
      "url": "https://mcp.pubfi.ai",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer ${env:PROD_PUBFI_API_KEY}"
      }
    }
  }
}
```

Run:

```sh
devin mcp list
devin mcp get pubfi
```

Do not put the key value in `.devin/mcp_config.json`, because that project file is designed for
source control. See the official [Devin MCP configuration
guide](https://docs.devin.ai/cli/extensibility/mcp/configuration).

## Windsurf Legacy Cascade

New Devin Desktop tabs use Devin Local and its configuration above. The following file applies
only to the legacy Cascade agent:

```text
~/.codeium/windsurf/mcp_config.json
```

Add:

```json
{
  "mcpServers": {
    "pubfi": {
      "serverUrl": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer ${env:PROD_PUBFI_API_KEY}"
      }
    }
  }
}
```

Legacy Cascade also supports `${file:/absolute/path}` interpolation. Use a protected secret file
if the desktop process does not receive shell environment variables. See the official [Cascade
MCP guide](https://docs.devin.ai/desktop/cascade/mcp).

## Gemini CLI

Gemini CLI uses `~/.gemini/settings.json` for user scope and `.gemini/settings.json` for project
scope. Its documented HTTP-header form uses a static value, so put this entry only in the private
user file:

```json
{
  "mcpServers": {
    "pubfi": {
      "httpUrl": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer <Production PubFi API key>"
      }
    }
  }
}
```

Replace the placeholder locally. Do not commit or share the resulting file. Run
`gemini mcp list` to check the connection. Use `httpUrl` for Streamable HTTP; `url` selects the
legacy SSE transport.

If local policy forbids a static header, use the [stdio bridge](#clients-that-need-the-stdio-bridge)
instead. Gemini can expand an environment variable in a stdio server's `env` map.

See the official [Gemini CLI MCP
guide](https://google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html).

## Kiro IDE And Kiro CLI

Open `.kiro/settings/mcp.json` for workspace scope or `~/.kiro/settings/mcp.json` for user scope:

```json
{
  "mcpServers": {
    "pubfi": {
      "url": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer ${PROD_PUBFI_API_KEY}"
      }
    }
  }
}
```

Kiro expands the environment variable and reconnects when you save the file. Use `/mcp` in an
interactive Kiro CLI session or the IDE MCP panel to inspect the server.

See the official Kiro [IDE](https://kiro.dev/docs/mcp/configuration/) and
[CLI](https://kiro.dev/docs/cli/mcp/configuration/) configuration guides.

## Amazon Q Developer IDE And CLI

For the IDE, open the Amazon Q Developer panel, select **Chat**, select the tools icon, and add an
MCP server. Use:

- Scope: **Global**
- Name: `pubfi`
- Transport: `http`
- URL: `https://mcp.pubfi.ai`
- Header name: `Authorization`
- Header value: `Bearer <Production PubFi API key>`

Global scope keeps the static header out of the project. Protect `~/.aws/amazonq/default.json`, do
not sync or share it, and leave tool permissions on **Ask** for the first connection. If Amazon Q
starts an OAuth flow, remove the direct entry and use the bridge below.

The current Amazon Q Developer CLI documentation describes open or OAuth-authenticated remote MCP
servers, but it does not describe an arbitrary static header for them. Use the
[stdio bridge](#clients-that-need-the-stdio-bridge) for the PubFi API-key lane. Add the
[generic stdio entry](#generic-stdio-entry) to the private global agent configuration, then run
`qchat mcp list` and `qchat mcp status` to inspect it. Do not configure the Production endpoint as
an unauthenticated remote server.

See the official Amazon Q Developer [IDE MCP
guide](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/mcp-ide.html) and [CLI MCP
guide](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-mcp-config-CLI.html).

## Continue

Create `.continue/mcpServers/pubfi.yaml`:

```yaml
name: PubFi MCP
version: 0.0.1
schema: v1
mcpServers:
  - name: pubfi
    type: streamable-http
    url: https://mcp.pubfi.ai
    apiKey: ${{ secrets.PROD_PUBFI_API_KEY }}
```

Store `PROD_PUBFI_API_KEY` in `~/.continue/.env`, a private workspace `.env`, or the Continue
secret facility. Do not commit the `.env` file. MCP tools are available in Continue Agent mode.

See the official Continue [MCP guide](https://docs.continue.dev/customize/deep-dives/mcp) and
[local secret guide](https://docs.continue.dev/guides/configuring-models-rules-tools).

## Cline IDE And CLI

For Cline CLI, edit `~/.cline/mcp.json`. In the IDE, open **MCP Servers** and then
**Configure MCP Servers**. Use a user-level file, not a project file:

```json
{
  "mcpServers": {
    "pubfi": {
      "type": "streamableHttp",
      "url": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer <Production PubFi API key>"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Replace the placeholder only in the private local file. Keep `autoApprove` empty until you have
reviewed the three tools. Cline's Remote Servers tab can create the same Streamable HTTP entry.

See the official [Cline MCP guide](https://docs.cline.bot/mcp/mcp-overview).

## Roo Code

Open Roo Code's MCP settings and select **Edit Global MCP**. Do not use the project
`.roo/mcp.json` file for a static key:

```json
{
  "mcpServers": {
    "pubfi": {
      "type": "streamable-http",
      "url": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer <Production PubFi API key>"
      },
      "alwaysAllow": [],
      "disabled": false
    }
  }
}
```

Replace the placeholder in the private global file. Leave `alwaysAllow` empty for the first
connection.

See the official [Roo Code MCP
guide](https://docs.roocode.com/features/mcp/using-mcp-in-roo).

## Zed

Open **Settings → AI → MCP Servers → Add Server → Add Remote Server**. Enter:

- URL: `https://mcp.pubfi.ai`
- Header name: `Authorization`
- Header value: `Bearer <Production PubFi API key>`

Zed writes a `context_servers` entry to the user settings file. Keep that setting private and do
not sync or share the static header. A green status indicator means that the server is active.

See the official [Zed MCP guide](https://zed.dev/docs/ai/mcp).

## Raycast AI

Run **Install MCP Server** and select the HTTP transport. Enter:

- URL: `https://mcp.pubfi.ai`
- HTTP header name: `Authorization`
- HTTP header value: `Bearer <Production PubFi API key>`

Raycast starts the connection and loads the tools. Use **Manage MCP Servers** to review status and
the tool list. Keep the header private. Do not paste it into a shared Raycast export.

See the official [Raycast MCP
guide](https://manual.raycast.com/ai/model-context-protocol).

## LM Studio

Open the **Program** panel, select **Install → Edit mcp.json**, and add:

```json
{
  "mcpServers": {
    "pubfi": {
      "url": "https://mcp.pubfi.ai",
      "headers": {
        "Authorization": "Bearer <Production PubFi API key>"
      }
    }
  }
}
```

Replace the placeholder only in LM Studio's private local file. Do not publish or share the
resulting `mcp.json`. Enable `pubfi` in the Program panel and use a model that supports tool calls.
For server-side LM Studio integrations, custom headers are also supported on an ephemeral MCP
entry, but the key must remain in the caller's secret store.

See the official LM Studio [MCP host
guide](https://lmstudio.ai/docs/app/mcp) and [MCP API
guide](https://lmstudio.ai/docs/developer/core/mcp).

## OpenCode

Add this entry to the user configuration, normally `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "pubfi": {
      "type": "remote",
      "url": "https://mcp.pubfi.ai",
      "enabled": true,
      "oauth": false,
      "headers": {
        "Authorization": "Bearer {env:PROD_PUBFI_API_KEY}"
      }
    }
  }
}
```

`oauth: false` prevents an unrelated OAuth attempt on the current PubFi API-key lane. Run
`opencode mcp list` to check the connection. If needed, run `opencode mcp debug pubfi` to inspect
the transport without copying the key into a prompt.

See the official [OpenCode MCP guide](https://opencode.ai/docs/mcp-servers/).

## Warp Local Agents

Open **Settings → Agents → MCP servers**, add a **Streamable HTTP or SSE Server (URL)**, and enter:

- URL: `https://mcp.pubfi.ai`
- Header name: `Authorization`
- Header value: `Bearer <Production PubFi API key>`

Keep the server under **Personal** and do not share it with a team. Warp documents custom headers
for remote MCP servers, but it does not document environment expansion in remote header values.
Use the [stdio bridge](#clients-that-need-the-stdio-bridge) if local policy forbids a static value.
After the server starts, review its three tools and keep MCP auto-approval disabled until you have
reviewed execution behavior.

See the official [Warp MCP guide](https://docs.warp.dev/agent-platform/capabilities/mcp).

## LibreChat

Open **MCP Settings** in the right sidebar, select **+**, and enter:

- Name: `pubfi`
- URL: `https://mcp.pubfi.ai`
- Transport: **Streamable HTTP**
- Authentication: **API Key**
- Key source: **User provides key**
- Header format: **Bearer**

Each user must enter their own Production PubFi client key when LibreChat asks for the API key.
Do not put a shared PubFi key in `librechat.yaml`. An administrator can share the server
definition, but must not store a user's key in that definition. In the Agent Builder, enable the
two discovery tools first and add `pubfi.route.execute` only when the agent must execute routes.

See the official LibreChat [MCP guide](https://www.librechat.ai/docs/features/mcp) and
[server configuration
reference](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/mcp_servers).

## Clients That Need The Stdio Bridge

The checked-in bridge is for clients that launch a local MCP command or do not document a safe
custom HTTP-header configuration. It forwards to PubFi's hosted MCP endpoint. It does not run a
second PubFi backend.

Clone the [PubFi Docs repository](https://github.com/helixbox/pubfi-docs), install a supported
Node.js runtime, and use the absolute path to:

```text
examples/agents/pubfi-route-tools-mcp/server.mjs
```

The bridge reads `PROD_PUBFI_API_KEY` or `STG_PUBFI_API_KEY` from its process environment. It also
accepts only the exact Production or Staging MCP root.

### Generic Stdio Entry

Replace `/absolute/path/to/pubfi-docs` with the checkout path:

```json
{
  "mcpServers": {
    "pubfi": {
      "command": "node",
      "args": [
        "/absolute/path/to/pubfi-docs/examples/agents/pubfi-route-tools-mcp/server.mjs"
      ],
      "env": {
        "PUBFI_MCP_ENDPOINT": "https://mcp.pubfi.ai",
        "PROD_PUBFI_API_KEY": "<Production PubFi API key>"
      }
    }
  }
}
```

This example contains a placeholder. Put the real value only in a private user-level client file.
If the client can inherit environment variables, omit `PROD_PUBFI_API_KEY` from the `env` map and
start the client from a secret-injected environment instead.

### Claude Desktop

Open:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add the [generic stdio entry](#generic-stdio-entry), save the file, and fully restart Claude
Desktop. Use absolute paths. See the official [local MCP server
guide](https://modelcontextprotocol.io/docs/develop/connect-local-servers).

### JetBrains AI Assistant

Open **Settings → Tools → AI Assistant → Model Context Protocol (MCP)**, add an STDIO server, and
paste:

```json
{
  "mcpServers": {
    "pubfi": {
      "command": "node",
      "args": [
        "/absolute/path/to/pubfi-docs/examples/agents/pubfi-route-tools-mcp/server.mjs"
      ]
    }
  }
}
```

Start the IDE from an environment that supplies `PROD_PUBFI_API_KEY` and
`PUBFI_MCP_ENDPOINT=https://mcp.pubfi.ai`. JetBrains documents remote Streamable HTTP, but its
current AI Assistant guide does not document custom remote headers. The bridge keeps the key out
of the JetBrains JSON entry.

See the official [JetBrains AI Assistant MCP
guide](https://www.jetbrains.com/help/ai-assistant/mcp.html).

### goose Desktop And CLI

Run `goose configure`, select **Add Extension**, and add a local STDIO extension. You can also add
this private user configuration under `extensions` in `~/.config/goose/config.yaml`:

```yaml
pubfi:
  type: stdio
  name: pubfi
  enabled: true
  cmd: node
  args:
    - /absolute/path/to/pubfi-docs/examples/agents/pubfi-route-tools-mcp/server.mjs
  env_keys:
    - PROD_PUBFI_API_KEY
  envs:
    PUBFI_MCP_ENDPOINT: https://mcp.pubfi.ai
  available_tools: []
  timeout: 300
```

Supply `PROD_PUBFI_API_KEY` through the process environment or goose's supported secret storage.
Do not put the key in `config.yaml`. Restart goose after a direct config edit, then run
`goose info -v` to verify that `pubfi` is enabled.

See the official goose [configuration
guide](https://goose-docs.ai/docs/guides/config-files/) and [custom extension
guide](https://goose-docs.ai/docs/tutorials/custom-extensions/).

### Cherry Studio

Open **Settings → MCP Server → Add Server** and enter:

- Name: `pubfi`
- Type: **STDIO**
- Command: `node`, or the absolute path to the Node.js executable
- Arguments: the absolute path to `examples/agents/pubfi-route-tools-mcp/server.mjs`

Supply `PUBFI_MCP_ENDPOINT=https://mcp.pubfi.ai` and `PROD_PUBFI_API_KEY` through the private
per-user server environment or start Cherry Studio from a secret-injected environment. Do not put
the key in a shared export. Save the server, enable it in the chat box, and use a model that
supports tool calls.

See the official Cherry Studio [MCP configuration
guide](https://docs.cherry-ai.com/docs/en-us/advanced-basic/mcp/config).

### Gemini CLI With The Bridge

Use this user-level `settings.json` entry when local policy forbids a static HTTP header:

```json
{
  "mcpServers": {
    "pubfi": {
      "command": "node",
      "args": [
        "/absolute/path/to/pubfi-docs/examples/agents/pubfi-route-tools-mcp/server.mjs"
      ],
      "env": {
        "PUBFI_MCP_ENDPOINT": "https://mcp.pubfi.ai",
        "PROD_PUBFI_API_KEY": "$PROD_PUBFI_API_KEY"
      }
    }
  }
}
```

Gemini expands the parent environment variable in the stdio `env` map.

## Other MCP Clients

For another client, first confirm in its current official documentation that it supports one of
these connection forms:

- **Streamable HTTP with custom headers:** use the exact PubFi environment root and an
  `Authorization: Bearer ...` header. Use the client's secret or environment reference if it has
  one. Otherwise keep the header only in a private, unsynced user setting.
- **Local STDIO command:** use the checked-in bridge and inject the matching key into the bridge
  process environment.
- **Remote URL without custom headers:** public discovery can work, but authenticated execution
  through the current API-key lane is not established.
- **OAuth-only hosted connector:** do not assume compatibility. Use a local client or wait for a
  documented PubFi-compatible hosted authentication flow.

Always verify the three generic PubFi tools before you allow execution. A client that requires a
provider-specific `subscan.*` or `degov.*` tool shape is not compatible with PubFi's current
generic route interface.

## Hosted Web Client Boundaries

### ChatGPT Web

ChatGPT web does not read local Codex MCP configuration. Current ChatGPT custom apps connect to a
remote MCP server from OpenAI infrastructure. The current official app guide documents OAuth but
does not document a user-supplied static bearer header for every request.

PubFi's anonymous handshake and capability tools can be scanned without a key, but this guide does
not claim that ChatGPT web can execute the current PubFi API-key lane. Use Codex CLI, the Codex IDE
extension, or ChatGPT desktop until PubFi exposes a compatible hosted auth flow or OpenAI
documents a static-key mechanism for custom apps.

See the official [ChatGPT developer mode and MCP app
guide](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta).

### Claude Web And Cloud Custom Connectors

Claude custom connectors run from Anthropic infrastructure. The current connector UI documents a
remote URL and optional OAuth client credentials. It does not document an arbitrary static bearer
header.

The public capability tools can connect without a key, but this guide does not claim authenticated
`pubfi.route.execute` compatibility through a Claude cloud connector. Use Claude Code or the
Claude Desktop local stdio bridge for the current API-key lane.

See the official [Claude custom connector
guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).

## Verify Discovery Without Spending A Request

After the client reports that `pubfi` is connected, ask:

```text
Use only the PubFi MCP tools. Call pubfi.capabilities.list with
provider_key "degov". Follow every next_cursor for this installed generation.
Do not call pubfi.route.execute. Select one ready capability, call
pubfi.capabilities.get with its exact capability_id, and show its method,
raw_path, required inputs, and readiness.
```

Repeat with `provider_key "subscan"`. This verifies the generic list and detail flow. Capability
reads do not consume an account execution request.

Do not ask the model to invent a path from a provider name. Do not continue if the detail is
blocked or if it belongs to a different Registry generation.

## Verify One Controlled Execution

First ask the agent to plan and wait:

```text
Use only the PubFi MCP tools. List the current DeGov capabilities and select
one ready GET capability with no required query or body, if one exists. Get
its exact detail. Show me the capability_id, raw_path, method, readiness, and
required inputs. Ask for approval before execution.
```

Review the selected route. If you approve one account request, reply:

```text
Execute that exact raw_path and method once through pubfi.route.execute.
Use the configured PubFi API-key lane. Do not use x402, do not change the
route, and do not retry automatically.
```

The live Registry may have no matching no-input route. That is not a client failure. Select
another current ready capability and supply its exact required input, or stop.

## Troubleshooting

### The Client Shows No PubFi Server

- Use the exact environment root.
- Select Streamable HTTP, not legacy SSE.
- Restart or reload the client after a configuration change.
- Approve or trust the server when the client asks.
- For the bridge, use an absolute script path and a supported `node` executable.

### The Server Connects But Execution Returns An Auth Error

- Confirm that the client process can read the selected environment variable.
- Confirm that the header begins with `Bearer ` and contains the matching environment key.
- Do not send a Staging key to Production or a Production key to Staging.
- Configure `Authorization: Bearer <PubFi API key>`. `X-PubFi-Api-Key` is not accepted.
- Rotate the key if it appeared in a prompt, log, shared file, or settings sync.

### The Agent Looks For `subscan.*` Or `degov.*`

Tell it to use `pubfi.capabilities.list` with the exact `provider_key`, then get the selected
capability detail. Provider-specific public MCP tools do not exist.

### A Saved Route Is Now Blocked Or Missing

Start again from `pubfi.capabilities.list`. Cursors, readiness, capability ids, and route contracts
belong to the installed Registry generation. Do not execute a saved route from an older
generation.

### The Client Starts An OAuth Flow

PubFi's current documented account lane uses an API key in a request header. Configure the custom
header or use the stdio bridge. Do not complete an unrelated OAuth flow and assume it authorizes
PubFi execution.

### The Tool Returns An x402 Challenge

The request did not use a valid PubFi API key, or you intentionally selected accountless payment.
A general MCP client cannot pay unless it implements the official x402 MCP metadata flow and has a
separately managed wallet. Fix the API-key transport or continue with [Accountless
x402](/getting-started/x402).

For current tool schemas and execution rules, continue to the [Agent Interface
Reference](/reference/agent-interface).
