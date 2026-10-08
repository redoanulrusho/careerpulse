#!/usr/bin/env node
/**
 * Builds a single-file, no-build-step demo of CareerPulse from the same JSON content.
 *
 *   npm run build:demo
 *
 * Outputs:
 *   demo/dist/careerpulse-demo.html             – page fragment (for hosts that add their own <html>/<head>)
 *   demo/dist/careerpulse-demo-standalone.html  – complete HTML file you can open directly in a browser
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Lucide from "lucide-react";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(root, "src", "data", "fields");
const outDir = path.join(root, "demo", "dist");

// Keep the same "featured" order as the app by reading the slug list.
const slugSource = await readFile(path.join(dataDir, "slugs.ts"), "utf8");
const order = [...slugSource.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
const files = (await readdir(dataDir)).filter((f) => f.endsWith(".json"));
const bySlug = Object.fromEntries(
  await Promise.all(
    files.map(async (f) => {
      const field = JSON.parse(await readFile(path.join(dataDir, f), "utf8"));
      return [field.slug, field];
    }),
  ),
);
const fields = order.map((slug) => {
  if (!bySlug[slug]) throw new Error(`Missing data for slug "${slug}"`);
  return bySlug[slug];
});

let template = await readFile(path.join(root, "demo", "template.html"), "utf8");

// Every PascalCase string in the template that is a Lucide icon, plus the field icons.
const candidates = new Set([
  ...[...template.matchAll(/"([A-Z][A-Za-z0-9]+)"/g)].map((m) => m[1]),
  ...[...template.matchAll(/\{\{ICON:([A-Za-z0-9]+)\}\}/g)].map((m) => m[1]),
  ...fields.map((f) => f.icon),
  "Sparkles",
]);
const icons = {};
for (const name of candidates) {
  const Icon = Lucide[name];
  if (Icon && typeof Icon === "object") {
    icons[name] = renderToStaticMarkup(createElement(Icon, { "aria-hidden": "true" }));
  }
}
for (const f of fields) if (!icons[f.icon]) throw new Error(`Unknown icon "${f.icon}" in ${f.slug}`);

const sized = (svg, size) => svg.replace('width="24"', `width="${size}"`).replace('height="24"', `height="${size}"`);
template = template.replace(/\{\{ICON:([A-Za-z0-9]+)\}\}/g, (_, name) => sized(icons[name], 16));

// Escape "</" so content can never close the inline <script> early.
const safeJson = (value) => JSON.stringify(value).replace(/<\//g, "<\\/");
const page = template.replace("/*__DATA__*/[]", safeJson(fields)).replace("/*__ICONS__*/{}", safeJson(icons));

const standalone = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Roadmaps, free resources, projects, interview prep and salary data for 20 trending tech careers.">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${page}
</body>
</html>
`;

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "careerpulse-demo.html"), page);
await writeFile(path.join(outDir, "careerpulse-demo-standalone.html"), standalone);
console.log(
  `Built demo with ${fields.length} fields and ${Object.keys(icons).length} icons → demo/dist (${(Buffer.byteLength(page) / 1024).toFixed(0)} KB)`,
);
