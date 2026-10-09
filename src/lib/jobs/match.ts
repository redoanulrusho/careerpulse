/** Escapes a string for literal use inside a RegExp. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds one case-insensitive matcher for a list of keyword phrases.
 * Phrases match as whole words ("ROS" won't match "across"), and characters like
 * "/", ".", "+" and "#" inside phrases ("UI/UX", "Next.js", "C++") are matched literally.
 */
export function buildKeywordMatcher(keywords: string[]): (text: string) => boolean {
  const parts = keywords
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => escapeRegExp(k).replace(/\s+/g, "\\s+"));
  if (parts.length === 0) return () => false;
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${parts.join("|")})(?![\\p{L}\\p{N}])`, "iu");
  return (text) => pattern.test(text);
}
