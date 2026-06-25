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
checkMarkdownLinks();
checkDocsSiteLinks();
checkCanonicalDocsUrls();
checkTextHygiene();
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

  for (const page of navigationPages(docsJson)) {
    const target = path.join(root, `${page}.md`);

    if (!existsSync(target)) {
      failures.push(`missing docs.json navigation target: ${page}`);
    }
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

function checkTextHygiene() {
  const textFiles = walk(root).filter((file) =>
    [".md", ".json", ".mjs", ".sh", ".yml", ".yaml"].includes(path.extname(file))
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
        [".md", ".json", ".yaml", ".yml"].includes(path.extname(file)) &&
        unsafeClaimPattern.test(line) &&
        !isExplicitNegativeContext(lines, index)
      ) {
        failures.push(`unsafe SEO/GEO success claim: ${relative(file)}:${index + 1}`);
      }

      if (
        [".md", ".json", ".yaml", ".yml"].includes(path.extname(file)) &&
        relative(file) !== "CHANGELOG.md" &&
        internalStrategyPattern.test(line) &&
        !isExplicitNegativeContext(lines, index)
      ) {
        failures.push(`internal strategy term in public docs: ${relative(file)}:${index + 1}`);
      }
    });
  }
}

function checkExampleSyntax() {
  const checks = [
    ["node", ["--check", "examples/agents/pubfi-route-tools-mcp/server.mjs"]],
    ["node", ["--check", "examples/agents/pubfi-route-tools-mcp/smoke_pubfi_route_tools_mcp.mjs"]],
    ["sh", ["-n", "examples/agents/capability-curl/wallet_account_balance.sh"]],
    ["sh", ["-n", "examples/agents/subscan-gateway/subscan_gateway_inspection.sh"]]
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

function relative(file) {
  return path.relative(root, file);
}
