import type { FIELD_SLUGS } from "./fields/slugs";

export type FieldSlug = (typeof FIELD_SLUGS)[number];

export interface JobKeywords {
  /**
   * Phrases matched (case-insensitive, whole words) against job titles and tags
   * from the Remotive feed. Keep them specific: short words like "AI" or "data"
   * on their own match far too much.
   */
  keywords: string[];
  /** Title search sent to Adzuna's `title_only` parameter (one focused phrase). */
  adzunaQuery: string;
  /** Search phrase for the "Search on Bdjobs" link (Bangladesh). */
  bdjobsQuery: string;
}

export const JOB_KEYWORDS: Record<FieldSlug, JobKeywords> = {
  "ai-agents": {
    keywords: [
      "AI agent",
      "AI agents",
      "agentic",
      "LLM",
      "LLMs",
      "LangChain",
      "LangGraph",
      "generative AI",
      "GenAI",
      "AI engineer",
      "RAG",
    ],
    adzunaQuery: "AI engineer",
    bdjobsQuery: "AI engineer",
  },
  "machine-learning": {
    keywords: [
      "machine learning",
      "ML engineer",
      "MLOps",
      "deep learning",
      "computer vision",
      "NLP",
      "PyTorch",
      "TensorFlow",
    ],
    adzunaQuery: "machine learning engineer",
    bdjobsQuery: "machine learning",
  },
  "data-science": {
    keywords: [
      "data scientist",
      "data science",
      "data analyst",
      "analytics",
      "business intelligence",
      "Power BI",
      "Tableau",
    ],
    adzunaQuery: "data scientist",
    bdjobsQuery: "data analyst",
  },
  cybersecurity: {
    keywords: [
      "security engineer",
      "cybersecurity",
      "cyber security",
      "information security",
      "SOC analyst",
      "penetration tester",
      "pentest",
      "AppSec",
    ],
    adzunaQuery: "cyber security",
    bdjobsQuery: "cyber security",
  },
  "cloud-engineering": {
    keywords: ["cloud engineer", "cloud architect", "AWS", "Azure", "GCP", "Google Cloud", "solutions architect"],
    adzunaQuery: "cloud engineer",
    bdjobsQuery: "cloud engineer",
  },
  "data-engineering": {
    keywords: [
      "data engineer",
      "data engineering",
      "ETL",
      "data pipeline",
      "Spark",
      "Airflow",
      "dbt",
      "Snowflake",
      "Databricks",
    ],
    adzunaQuery: "data engineer",
    bdjobsQuery: "data engineer",
  },
  "devops-platform": {
    keywords: [
      "DevOps",
      "SRE",
      "site reliability",
      "platform engineer",
      "Kubernetes",
      "infrastructure engineer",
      "Terraform",
    ],
    adzunaQuery: "devops engineer",
    bdjobsQuery: "devops",
  },
  "full-stack-web": {
    keywords: [
      "full stack",
      "full-stack",
      "fullstack",
      "frontend",
      "front-end",
      "front end",
      "backend",
      "back-end",
      "web developer",
      "React",
      "Next.js",
      "Node.js",
    ],
    adzunaQuery: "full stack developer",
    bdjobsQuery: "web developer",
  },
  "mobile-development": {
    keywords: ["mobile developer", "mobile engineer", "iOS", "Android", "Flutter", "React Native", "Swift", "Kotlin"],
    adzunaQuery: "mobile developer",
    bdjobsQuery: "flutter developer",
  },
  "ui-ux-design": {
    keywords: [
      "UX",
      "UI designer",
      "UI/UX",
      "product designer",
      "user experience",
      "user research",
      "interaction designer",
      "Figma",
    ],
    adzunaQuery: "UX designer",
    bdjobsQuery: "UI UX designer",
  },
  "product-management": {
    keywords: [
      "product manager",
      "product owner",
      "product management",
      "head of product",
      "technical product manager",
    ],
    adzunaQuery: "product manager",
    bdjobsQuery: "product manager",
  },
  "prompt-engineering": {
    keywords: [
      "prompt engineer",
      "prompt engineering",
      "AI trainer",
      "AI tutor",
      "LLM evaluator",
      "AI content",
      "conversation designer",
      "AI code trainer",
    ],
    adzunaQuery: "prompt engineer",
    bdjobsQuery: "prompt engineer",
  },
  "ai-governance": {
    keywords: [
      "AI governance",
      "responsible AI",
      "AI ethics",
      "AI safety",
      "AI policy",
      "AI risk",
      "AI compliance",
      "trust and safety",
    ],
    adzunaQuery: "AI governance",
    bdjobsQuery: "compliance",
  },
  "fintech-engineering": {
    keywords: ["fintech", "payments", "payment", "banking", "ledger", "trading systems", "financial services", "PCI"],
    adzunaQuery: "fintech developer",
    bdjobsQuery: "fintech",
  },
  "embedded-iot": {
    keywords: ["embedded", "firmware", "IoT", "RTOS", "microcontroller", "FPGA", "embedded Linux", "hardware engineer"],
    adzunaQuery: "embedded software engineer",
    bdjobsQuery: "embedded",
  },
  "green-tech": {
    keywords: ["climate", "sustainability", "renewable", "clean energy", "carbon", "ESG", "solar", "energy transition"],
    adzunaQuery: "sustainability analyst",
    bdjobsQuery: "sustainability",
  },
  robotics: {
    keywords: [
      "robotics",
      "robot",
      "ROS",
      "automation engineer",
      "controls engineer",
      "autonomous systems",
      "mechatronics",
    ],
    adzunaQuery: "robotics engineer",
    bdjobsQuery: "automation engineer",
  },
  "ar-vr": {
    keywords: [
      "AR/VR",
      "XR",
      "virtual reality",
      "augmented reality",
      "mixed reality",
      "Unity developer",
      "Unreal",
      "spatial computing",
      "visionOS",
    ],
    adzunaQuery: "unity developer",
    bdjobsQuery: "unity developer",
  },
  "blockchain-web3": {
    keywords: [
      "blockchain",
      "web3",
      "Solidity",
      "smart contract",
      "smart contracts",
      "crypto",
      "DeFi",
      "Ethereum",
      "Solana",
    ],
    adzunaQuery: "blockchain developer",
    bdjobsQuery: "blockchain",
  },
  "quantum-computing": {
    keywords: ["quantum", "Qiskit", "quantum computing", "quantum software", "post-quantum", "cryptography"],
    adzunaQuery: "quantum",
    bdjobsQuery: "research scientist",
  },
};

/** Bdjobs' own search page, pre-filled with the field's search phrase (no scraping, just a link). */
export function bdjobsSearchUrl(slug: FieldSlug): string {
  return `https://bdjobs.com/h/jobs?txtsearch=${encodeURIComponent(JOB_KEYWORDS[slug].bdjobsQuery)}`;
}
