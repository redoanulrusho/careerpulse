export const MAX_COMPARE = 3;
export const MIN_COMPARE = 2;

/**
 * Parses `?fields=a,b,c` into a list of known, unique slugs (max 3).
 * Unknown slugs are dropped so a stale or hand-edited URL never breaks the page.
 */
export function parseCompareParam(param: string | null | undefined, validSlugs: string[]): string[] {
  if (!param) return [];
  const valid = new Set(validSlugs);
  const result: string[] = [];
  for (const raw of param.split(",")) {
    const slug = raw.trim().toLowerCase();
    if (valid.has(slug) && !result.includes(slug)) result.push(slug);
    if (result.length === MAX_COMPARE) break;
  }
  return result;
}

export function compareHref(slugs: string[]): string {
  return slugs.length ? `/compare?fields=${slugs.join(",")}` : "/compare";
}

/** Returns the index of the highest value, or -1 when there is a tie for first place. */
export function bestIndex(values: number[]): number {
  if (values.length === 0) return -1;
  const max = Math.max(...values);
  const winners = values.filter((v) => v === max).length;
  return winners === 1 ? values.indexOf(max) : -1;
}
