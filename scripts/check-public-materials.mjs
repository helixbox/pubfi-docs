#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const docsJsonPath = path.join(root, "docs.json");
const docsDomain = "https://docs.pubfi.ai";
const failures = [];

checkNavigation();
checkRouteShape();
checkMcpClientCoverage();
checkMarkdownLinks();
checkDocsSiteLinks();
checkCanonicalDocsUrls();
checkCanonicalDocsIndex();
checkTextHygiene();
checkCurrentRuntimeContracts();
checkExampleSyntax();

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log("public materials check: pass");

function checkNavigation() {
  const docsJson = JSON.parse(readFileSync(docsJsonPath, "utf8"));
  const pages = navigationPages(docsJson);
  const seenPages = new Set();

  for (const page of pages) {
    const target = path.join(root, `${page}.md`);

    if (!existsSync(target)) {
      failures.push(`missing docs.json navigation target: ${page}`);
      continue;
    }

    if (seenPages.has(page)) {
      failures.push(`duplicate docs.json navigation target: ${page}`);
    }
    seenPages.add(page);

    const text = readFileSync(target, "utf8");
    const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);

    if (
      !frontmatter ||
      !/^title:\s*.+$/m.test(frontmatter[1]) ||
      !/^description:\s*.+$/m.test(frontmatter[1])
    ) {
      failures.push(`navigation page must set title and description frontmatter: ${page}`);
    }

    if (/^#\s+/m.test(text)) {
      failures.push(`navigation page must use the frontmatter title as its only H1: ${page}`);
    }
  }

  const expectedPages = [
    "index",
    "project-overview",
    "faq",
    "glossary",
    ...["getting-started", "concepts", "agent-readable", "use-cases", "reference"].flatMap(
      (directory) =>
        readdirSync(path.join(root, directory), { withFileTypes: true })
          .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
          .map((entry) => `${directory}/${entry.name.slice(0, -3)}`)
    )
  ];

  for (const page of expectedPages) {
    if (!seenPages.has(page)) {
      failures.push(`public docs page is missing from docs.json navigation: ${page}`);
    }
  }

  const mcpClientPage = readFileSync(
    path.join(root, "getting-started/mcp-client.md"),
    "utf8"
  );

  if (!/^---\ntitle: MCP Client Setup\n/m.test(mcpClientPage)) {
    failures.push(
      "getting-started/mcp-client.md must set the exact MCP Client Setup title"
    );
  }
}

function checkRouteShape() {
  const docsJson = JSON.parse(readFileSync(docsJsonPath, "utf8"));
  const pages = navigationPages(docsJson);

  if (!pages.includes("index")) {
    failures.push("docs.json navigation must include root index page");
  }

  for (const page of pages) {
    if (page === "docs" || page.startsWith("docs/") || page.startsWith("/")) {
      failures.push(`docs.json navigation target must map to root docs domain routes: ${page}`);
    }
  }
}

function checkMcpClientCoverage() {
  const file = path.join(root, "getting-started/mcp-clients.md");
  const text = readFileSync(file, "utf8");
  const requiredSections = [
    "## Codex CLI, Codex IDE, And ChatGPT Desktop",
    "## Claude Code",
    "## VS Code With GitHub Copilot",
    "## GitHub Copilot CLI",
    "## GitHub Copilot Coding Agent",
    "## Cursor IDE And Cursor Agent",
    "## Devin CLI And Devin Local",
    "## Windsurf Legacy Cascade",
    "## Gemini CLI",
    "## Kiro IDE And Kiro CLI",
    "## Amazon Q Developer IDE And CLI",
    "## Continue",
    "## Cline IDE And CLI",
    "## Roo Code",
    "## Zed",
    "## Raycast AI",
    "## LM Studio",
    "## OpenCode",
    "## Warp Local Agents",
    "## LibreChat",
    "### Claude Desktop",
    "### JetBrains AI Assistant",
    "### goose Desktop And CLI",
    "### Cherry Studio",
    "## Other MCP Clients",
    "### ChatGPT Web",
    "### Claude Web And Cloud Custom Connectors"
  ];

  for (const section of requiredSections) {
    if (!text.includes(section)) {
      failures.push(`MCP client guide is missing required coverage: ${section}`);
    }
  }

  const requiredConfigMarkers = [
    'bearer_token_env_var = "PROD_PUBFI_API_KEY"',
    "${input:pubfi-production-api-key}",
    "${env:PROD_PUBFI_API_KEY}",
    "${COPILOT_MCP_PUBFI_API_KEY}",
    '"httpUrl": "https://mcp.pubfi.ai"',
    "${{ secrets.PROD_PUBFI_API_KEY }}",
    '"type": "streamableHttp"',
    '"type": "streamable-http"',
    '"Authorization": "Bearer {env:PROD_PUBFI_API_KEY}"',
    "examples/agents/pubfi-route-tools-mcp/server.mjs"
  ];

  for (const marker of requiredConfigMarkers) {
    if (!text.includes(marker)) {
      failures.push(`MCP client guide is missing required config marker: ${marker}`);
    }
  }

  for (const tool of [
    "pubfi.capabilities.list",
    "pubfi.capabilities.get",
    "pubfi.route.execute"
  ]) {
    if (!text.includes(tool)) {
      failures.push(`MCP client guide is missing the current tool: ${tool}`);
    }
  }

  const jsonBlocks = [...text.matchAll(/```json\n([\s\S]*?)\n```/g)];

  for (const [index, block] of jsonBlocks.entries()) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      failures.push(`MCP client guide JSON block ${index + 1} is invalid: ${error.message}`);
    }
  }
}

function checkMarkdownLinks() {
  const files = walk(root).filter((file) => file.endsWith(".md"));
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const file of files) {
    const text = readFileSync(file, "utf8");

    for (const match of text.matchAll(linkPattern)) {
      const href = match[1].trim();

      if (isExternalOrAnchor(href) || href.startsWith("/")) {
        continue;
      }

      const clean = href.split("#")[0];

      if (!clean) {
        continue;
      }

      const target = path.normalize(path.join(path.dirname(file), clean));

      if (!existsSync(target)) {
        failures.push(`broken local link: ${relative(file)} -> ${href}`);
      }
    }
  }
}

function checkDocsSiteLinks() {
  const docsJson = JSON.parse(readFileSync(docsJsonPath, "utf8"));
  const files = navigationPages(docsJson).map((page) => path.join(root, `${page}.md`));
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const file of files) {
    const text = readFileSync(file, "utf8");

    for (const match of text.matchAll(linkPattern)) {
      const href = match[1].trim();

      if (isExternalOrAnchor(href)) {
        continue;
      }

      if (
        href.includes(".md") ||
        href.startsWith("..") ||
        !href.startsWith("/") ||
        href === "/docs" ||
        href.startsWith("/docs/")
      ) {
        failures.push(
          `docs site link must use a root Mintlify route: ${relative(file)} -> ${href}`
        );
      }
    }
  }
}

function checkCanonicalDocsUrls() {
  const textFiles = walk(root).filter((file) =>
    [".md", ".json", ".mjs", ".txt", ".yml", ".yaml"].includes(path.extname(file))
  );

  for (const file of textFiles) {
    const lines = readFileSync(file, "utf8").split("\n");

    lines.forEach((line, index) => {
      if (line.includes(`${docsDomain}/docs`)) {
        failures.push(`canonical docs URL must not include /docs: ${relative(file)}:${index + 1}`);
      }
    });
  }
}

function checkCanonicalDocsIndex() {
  const docsJson = JSON.parse(readFileSync(docsJsonPath, "utf8"));
  const navigationUrls = navigationPages(docsJson).map((page) =>
    page === "index" ? docsDomain : `${docsDomain}/${page}`
  );
  const llmsFull = readFileSync(path.join(root, "llms-full.txt"), "utf8");
  const canonicalSection = llmsFull.match(
    /## Canonical Docs Pages\n\n([\s\S]*?)(?=\n## |\s*$)/
  );

  if (!canonicalSection) {
    failures.push("llms-full.txt must include a Canonical Docs Pages section");
    return;
  }

  const canonicalUrls = [...canonicalSection[1].matchAll(/^- (https:\/\/docs\.pubfi\.ai\S*)$/gm)]
    .map((match) => match[1]);

  if (JSON.stringify(canonicalUrls) !== JSON.stringify(navigationUrls)) {
    failures.push(
      "llms-full.txt Canonical Docs Pages must match docs.json navigation order"
    );
  }
}

function checkTextHygiene() {
  const textFiles = walk(root).filter((file) =>
    [".md", ".json", ".mjs", ".sh", ".txt", ".yml", ".yaml"].includes(path.extname(file))
  );
  const secretPattern =
    /sk-[A-Za-z0-9]{20,}|pf_sk_v1_[A-Za-z0-9_\-]{16,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY-----|password\s*=|secret\s*=/;
  const unsafeClaimPattern =
    /\b(SEO success|GEO success|ranking won|citation proven|traffic success|AI citation success)\b/i;
  const internalStrategyPattern =
    /\b(Query Graph|Demand Emergence Score|query cluster map|content brief template|answer-engine readback|external distribution targets)\b/i;

  for (const file of textFiles) {
    const lines = readFileSync(file, "utf8").split("\n");

    lines.forEach((line, index) => {
      if (/[ \t]+$/.test(line)) {
        failures.push(`trailing whitespace: ${relative(file)}:${index + 1}`);
      }

      if (secretPattern.test(line)) {
        failures.push(`possible secret: ${relative(file)}:${index + 1}`);
      }

      if (
        [".md", ".json", ".txt", ".yaml", ".yml"].includes(path.extname(file)) &&
        unsafeClaimPattern.test(line) &&
        !isExplicitNegativeContext(lines, index)
      ) {
        failures.push(`unsafe SEO/GEO success claim: ${relative(file)}:${index + 1}`);
      }

      if (
        [".md", ".json", ".txt", ".yaml", ".yml"].includes(path.extname(file)) &&
        relative(file) !== "CHANGELOG.md" &&
        internalStrategyPattern.test(line) &&
        !isExplicitNegativeContext(lines, index)
      ) {
        failures.push(`internal strategy term in public docs: ${relative(file)}:${index + 1}`);
      }
    });
  }
}

function checkCurrentRuntimeContracts() {
  const textFiles = walk(root).filter(
    (file) =>
      [".md", ".json", ".mjs", ".sh", ".txt", ".yml", ".yaml"].includes(path.extname(file)) &&
      !["CHANGELOG.md", "scripts/check-public-materials.mjs"].includes(relative(file))
  );
  const retiredContractPatterns = [
    {
      label: "retired capability execution route",
      pattern: /\/v1\/capabilities\/(?:\{[^}]+\}|[A-Za-z0-9._:-]+)/
    },
    {
      label: "retired gateway catalog route",
      pattern: /\/v1\/gateway\/catalog\b/
    },
    {
      label: "retired static provider OpenAPI",
      pattern: /\/openapi\/(?:degov|subscan)-openapi\.json\b/i
    },
    {
      label: "retired MCP input or result field",
      pattern:
        /`(?:route_id|route_plan|required_capabilities|allow_paid|dry_run|intent)`|["'](?:route_id|route_plan|required_capabilities|allow_paid|dry_run|intent)["']\s*:|\b(?:selected_route_id|selected_callability|production_route_time_model_enabled|supplier_execution_enabled|payment_execution_enabled|capability_response_body|candidate_capabilities|provider_specific_public_tools|provider_specific_route_rejected|capability_runtime_v1|gateway_available)\b/
    },
    {
      label: "retired MCP tool",
      pattern:
        /\bpubfi\.(?:capabilities\.search|route\.(?:plan|explain)|schema\.get)\b/
    },
    {
      label: "retired MCP five-purpose tool list",
      pattern:
        /\bsearch, planning, explanation, schema, and execution tools\b/i
    }
  ];
  const retiredEnvelopePattern = /\bpubfi\.capability\.response\.v1\b/;
  const blanketNoX402Patterns = [
    /\bPubFi does not (?:publicly )?(?:publish|support|offer|provide|promise)\b[^\n.]{0,120}\b(?:x402|payment endpoint|payment execution)\b/i,
    /\blive x402 payment execution\b/i,
    /\b(?:no|without)\s+(?:live\s+)?x402(?:\s+(?:support|payment|execution))?\b/i,
    /\b(?:does not support|does not offer|does not provide|unsupported|unavailable|disabled)\b[^\n.]{0,60}\bx402\b/i,
    /\bx402\b[^\n.]{0,60}\b(?:not supported|unsupported|disabled|unavailable)\b/i
  ];

  for (const file of textFiles) {
    const lines = readFileSync(file, "utf8").split("\n");

    lines.forEach((line, index) => {
      for (const { label, pattern } of retiredContractPatterns) {
        if (pattern.test(line)) {
          failures.push(`${label}: ${relative(file)}:${index + 1}`);
        }
      }

      if (retiredEnvelopePattern.test(line) && !isRetiredContractReference(line)) {
        failures.push(`retired capability response envelope: ${relative(file)}:${index + 1}`);
      }

      if (
        blanketNoX402Patterns.some((pattern) => pattern.test(line)) &&
        !isScopedX402Negative(line)
      ) {
        failures.push(`blanket no-x402 claim: ${relative(file)}:${index + 1}`);
      }
    });
  }
}

function checkExampleSyntax() {
  const checks = [
    ["node", ["--check", "examples/agents/pubfi-route-tools-mcp/server.mjs"]],
    ["node", ["--check", "examples/agents/pubfi-route-tools-mcp/bridge-response.mjs"]],
    ["node", ["--check", "examples/agents/pubfi-route-tools-mcp/endpoint-policy.mjs"]],
    ["node", ["--check", "examples/agents/pubfi-route-tools-mcp/smoke_pubfi_route_tools_mcp.mjs"]],
    [
      "node",
      [
        "--test",
        "examples/agents/pubfi-route-tools-mcp/bridge-response.test.mjs",
        "examples/agents/pubfi-route-tools-mcp/endpoint-policy.test.mjs"
      ]
    ],
    ["sh", ["-n", "examples/agents/capability-curl/inspect_registry.sh"]],
    ["sh", ["-n", "examples/agents/x402-base-sepolia/show_challenge.sh"]],
    ["node", ["--check", "examples/agents/x402-base-sepolia/http-paid.mjs"]],
    ["node", ["--check", "examples/agents/x402-base-sepolia/mcp-paid.mjs"]],
    ["node", ["--check", "examples/agents/x402-base-sepolia/payment-policy.mjs"]],
    ["node", ["--check", "examples/agents/x402-base-sepolia/signed-artifacts.mjs"]],
    [
      "node",
      ["--test", "examples/agents/x402-base-sepolia/payment-policy.test.mjs"]
    ],
    [
      "node",
      ["--test", "examples/agents/x402-base-sepolia/signed-artifacts.test.mjs"]
    ],
    ["sh", ["-n", "examples/agents/x402-base-mainnet/show_challenge.sh"]],
    ["node", ["--check", "examples/agents/x402-base-mainnet/http-paid.mjs"]],
    ["node", ["--check", "examples/agents/x402-base-mainnet/mcp-paid.mjs"]],
    ["node", ["--check", "examples/agents/x402-base-mainnet/payment-policy.mjs"]],
    ["node", ["--check", "examples/agents/x402-base-mainnet/signed-artifacts.mjs"]],
    [
      "node",
      ["--test", "examples/agents/x402-base-mainnet/payment-policy.test.mjs"]
    ],
    [
      "node",
      ["--test", "examples/agents/x402-base-mainnet/signed-artifacts.test.mjs"]
    ]
  ];

  for (const [command, args] of checks) {
    const result = spawnSync(command, args, {
      cwd: root,
      encoding: "utf8"
    });

    if (result.status !== 0) {
      failures.push(`example syntax failed: ${command} ${args.join(" ")}\n${result.stderr}`);
    }
  }
}

function navigationPages(docsJson) {
  const groups = Array.isArray(docsJson.navigation)
    ? docsJson.navigation
    : docsJson.navigation?.groups || [];
  const pages = [];

  for (const group of groups) {
    for (const page of group.pages || []) {
      if (typeof page === "string") {
        pages.push(page);
      }
    }
  }

  return pages;
}

function walk(dir) {
  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === ".worktrees" ||
      entry.name === "dist"
    ) {
      continue;
    }

    const filePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(filePath));
    } else if (entry.isFile()) {
      files.push(filePath);
    }
  }

  return files;
}

function isExternalOrAnchor(href) {
  return (
    !href ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("#") ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)
  );
}

function isExplicitNegativeContext(lines, index) {
  const context = lines.slice(Math.max(0, index - 8), index + 1).join(" ");

  return /\b(no|not|never|avoid|unsafe|without|proof|do not|does not|must not|cannot|is not|try to publish|implies|non-goals|unsafe claims|unsafe launch evidence|not_success_labels|risk)\b/i.test(
    context
  );
}

function isScopedX402Negative(line) {
  return /\b(MCP|mainnet|every route|all routes|this example|inspection)\b/i.test(line);
}

function isRetiredContractReference(line) {
  return /\b(retired|obsolete|removed|does not use|must not use)\b/i.test(line);
}

function relative(file) {
  return path.relative(root, file);
}
