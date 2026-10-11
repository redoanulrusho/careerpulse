import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Google Search Console verifies ownership by fetching this file from
 * https://careerpulse-beta.vercel.app/google5601346a45d457b3.html.
 * Never delete or edit it, or the site loses verification.
 */
describe("Google Search Console verification file", () => {
  it("exists in public/ with the exact contents Google issued", () => {
    const file = readFileSync(join(process.cwd(), "public", "google5601346a45d457b3.html"), "utf8");
    expect(file).toBe("google-site-verification: google5601346a45d457b3.html");
  });
});
