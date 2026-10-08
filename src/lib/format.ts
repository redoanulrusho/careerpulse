const usdFull = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const groupedInt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** 134040 → "$134,040" */
export function formatUsd(value: number): string {
  return usdFull.format(value);
}

/** 134040 → "$134k", 950 → "$950" */
export function formatUsdCompact(value: number): string {
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${value}`;
}

/** 18345 → "Tk 18,345" ("Tk" renders in every font, unlike the ৳ glyph). */
export function formatBdt(value: number): string {
  return `Tk ${groupedInt.format(value)}`;
}

/** 18345 → "18k", 100918 → "101k" (no currency prefix; use formatBdtRange for labels). */
export function formatBdtCompact(value: number): string {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

/** [18345, 100918] → "Tk 18k–101k" */
export function formatBdtRange([min, max]: [number, number]): string {
  return `Tk ${formatBdtCompact(min)}–${formatBdtCompact(max)}`;
}

export function formatUsdRange([min, max]: [number, number]): string {
  return `${formatUsdCompact(min)}–${formatUsdCompact(max)}`;
}

/** Turns arbitrary text into a URL/ID-safe slug. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Hostname without "www." for compact link labels. */
export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
