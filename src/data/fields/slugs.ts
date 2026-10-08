/**
 * Every published field slug. Kept separate from the JSON content so the
 * request-time proxy stays tiny. `tests/data.test.ts` checks it matches the data.
 */
export const FIELD_SLUGS = [
  "ai-agents",
  "machine-learning",
  "data-science",
  "cybersecurity",
  "cloud-engineering",
  "data-engineering",
  "devops-platform",
  "full-stack-web",
  "mobile-development",
  "ui-ux-design",
  "product-management",
  "prompt-engineering",
  "ai-governance",
  "fintech-engineering",
  "embedded-iot",
  "green-tech",
  "robotics",
  "ar-vr",
  "blockchain-web3",
  "quantum-computing",
] as const;
