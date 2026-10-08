#!/usr/bin/env node
/**
 * Captures README screenshots from a running instance of the app.
 *
 *   npm run build && npm start          # in one terminal
 *   BASE_URL=http://localhost:3000 npm run screenshots
 *
 * Requires: npx playwright install chromium
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, "docs", "screenshots");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const shots = [
  { name: "home-light", url: "/", theme: "light", width: 1440, height: 1100 },
  { name: "home-dark", url: "/#explore", theme: "dark", width: 1440, height: 1100, scrollTo: "#explore" },
  { name: "field-roadmap", url: "/fields/ai-agents#roadmap", theme: "light", width: 1440, height: 1200 },
  { name: "field-salary-dark", url: "/fields/cybersecurity#salary", theme: "dark", width: 1440, height: 1200 },
  {
    name: "compare",
    url: "/compare?fields=ai-agents,cybersecurity,data-science",
    theme: "light",
    width: 1440,
    height: 1300,
  },
  { name: "mobile-home", url: "/", theme: "dark", width: 390, height: 844, mobile: true },
  { name: "mobile-field", url: "/fields/full-stack-web#skills", theme: "light", width: 390, height: 844, mobile: true },
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: shot.width, height: shot.height },
    deviceScaleFactor: shot.mobile ? 2 : 1,
    isMobile: Boolean(shot.mobile),
    hasTouch: Boolean(shot.mobile),
  });
  await context.addInitScript((theme) => {
    localStorage.setItem("careerpulse:theme", theme);
    // Demo progress so progress bars render in screenshots.
    if (!localStorage.getItem("careerpulse:progress:v1")) {
      localStorage.setItem(
        "careerpulse:progress:v1",
        JSON.stringify([
          "ai-agents:roadmap:get-comfortable-with-python-virtual-environments-and-async-await",
          "ai-agents:roadmap:call-two-different-llm-apis-and-compare-outputs-latency-and-cost",
          "ai-agents:start:enrol-in-the-free-hugging-face-ai-agents-course",
          "full-stack-web:skills:git-and-github",
          "full-stack-web:skills:browser-devtools",
          "cybersecurity:start:turn-on-multi-factor-authentication-for-all-your-own-accounts",
        ]),
      );
    }
  }, shot.theme);
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(`${shot.name}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${shot.name}: console ${m.text()}`));
  await page.goto(BASE + shot.url, { waitUntil: "networkidle" });
  if (shot.scrollTo) await page.locator(shot.scrollTo).scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(out, `${shot.name}.png`) });
  console.log(`✓ ${shot.name}`);
  await context.close();
}

await browser.close();
if (errors.length) {
  console.log("\nPage errors:\n" + errors.join("\n"));
  process.exitCode = 1;
}
