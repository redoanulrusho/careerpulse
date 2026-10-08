#!/usr/bin/env node
/**
 * Checks every URL cited in src/data/fields/*.json.
 *
 *   npm run check-links
 *
 * 2xx/3xx = OK. 401/403/429 are reported as "blocked" (usually bot protection on
 * sites that work fine in a browser) and do not fail the run. 404/410/5xx and
 * network errors fail the run with exit code 1.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, "src", "data", "fields");
const CONCURRENCY = 8;
const TIMEOUT_MS = 20_000;
const BLOCKED = new Set([401, 403, 429, 999]);

function collect(field) {
  const urls = [
    ...field.overview.trendSources.map((s) => s.url),
    ...field.resources.map((r) => r.url),
    ...field.salary.bangladesh.sources.map((s) => s.url),
    ...field.salary.remote.sources.map((s) => s.url),
    ...field.salary.global.sources.map((s) => s.url),
  ];
  return urls.map((url) => ({ url, field: field.slug }));
}

async function check(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; CareerPulseLinkChecker/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    await res.body?.cancel();
    return res.status;
  } catch (err) {
    if (attempt < 3) return check(url, attempt + 1);
    return `error: ${err.cause?.code ?? err.message}`;
  }
}

const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
const entries = [];
for (const file of files) {
  entries.push(...collect(JSON.parse(await readFile(path.join(dir, file), "utf8"))));
}

const unique = new Map();
for (const e of entries) {
  if (!unique.has(e.url)) unique.set(e.url, new Set());
  unique.get(e.url).add(e.field);
}

console.log(`Checking ${unique.size} unique URLs (${entries.length} citations in ${files.length} fields)…\n`);

const queue = [...unique.keys()];
const results = [];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    const status = await check(url);
    results.push({ url, status, fields: [...unique.get(url)] });
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const ok = results.filter((r) => typeof r.status === "number" && r.status < 400);
const blocked = results.filter((r) => BLOCKED.has(r.status));
const broken = results.filter((r) => !ok.includes(r) && !blocked.includes(r));

for (const r of blocked) console.log(`BLOCKED ${r.status}  ${r.url}`);
for (const r of broken) console.log(`BROKEN  ${r.status}  ${r.url}  (${r.fields.join(", ")})`);
console.log(`\n${ok.length} ok · ${blocked.length} blocked by bot protection · ${broken.length} broken`);
process.exit(broken.length ? 1 : 0);
