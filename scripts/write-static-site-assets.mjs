#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const docsJson = JSON.parse(readFileSync(path.join(root, "docs.json"), "utf8"));
const canonicalBase =
  docsJson.seo?.metatags?.canonical?.replace(/\/+$/, "") || "https://docs.pubfi.ai";

if (!existsSync(distDir)) {
  console.error("dist directory does not exist; run Mintlify export first");
  process.exit(1);
}

mkdirSync(distDir, { recursive: true });

const routes = navigationPages(docsJson).map(routeForPage);
rewriteHtmlCanonicalMetadata();
writeFileSync(path.join(distDir, "sitemap.xml"), renderSitemap(routes));
writeFileSync(path.join(distDir, "robots.txt"), renderRobots());
writeFileSync(path.join(distDir, "vercel.json"), `${JSON.stringify(vercelConfig(), null, 2)}\n`);

console.log(`static site assets written: ${routes.length} sitemap routes`);

function navigationPages(config) {
  const groups = Array.isArray(config.navigation)
    ? config.navigation
    : config.navigation?.groups || [];
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

function routeForPage(page) {
  return page === "index" ? "/" : `/${page}`;
}

function renderSitemap(routes) {
  const urls = routes
    .map((route) => {
      const loc = route === "/" ? canonicalBase : `${canonicalBase}${route}`;
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function renderRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${canonicalBase}/sitemap.xml\n`;
}

function rewriteHtmlCanonicalMetadata() {
  const sourcePropsUrlPattern = new RegExp(
    `${escapeRegExp(canonicalBase)}/src/_props(?:/[A-Za-z0-9/_-]*)?`,
    "g"
  );

  for (const file of walk(distDir).filter((candidate) => candidate.endsWith(".html"))) {
    const canonicalUrl = canonicalUrlForHtml(file);
    const html = readFileSync(file, "utf8");
    const rewritten = html.replace(sourcePropsUrlPattern, canonicalUrl);

    if (rewritten !== html) {
      writeFileSync(file, rewritten);
    }
  }
}

function canonicalUrlForHtml(file) {
  const relativePath = path.relative(distDir, file).replaceAll(path.sep, "/");

  if (relativePath === "index.html" || relativePath === "index/index.html") {
    return canonicalBase;
  }

  if (relativePath.endsWith("/index.html")) {
    return `${canonicalBase}/${relativePath.slice(0, -"/index.html".length)}`;
  }

  return `${canonicalBase}/${relativePath.replace(/\.html$/, "")}`;
}

function vercelConfig() {
  return {
    redirects: [
      {
        source: "/index",
        destination: "/",
        permanent: true
      }
    ]
  };
}

function walk(dir) {
  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(filePath));
    } else if (entry.isFile()) {
      files.push(filePath);
    }
  }

  return files;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
