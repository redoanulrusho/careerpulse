import type { Field } from "@/lib/types";

import aiAgents from "./ai-agents.json";
import machineLearning from "./machine-learning.json";
import promptEngineering from "./prompt-engineering.json";
import dataScience from "./data-science.json";
import dataEngineering from "./data-engineering.json";
import cybersecurity from "./cybersecurity.json";
import cloudEngineering from "./cloud-engineering.json";
import devopsPlatform from "./devops-platform.json";
import fullStackWeb from "./full-stack-web.json";
import mobileDevelopment from "./mobile-development.json";
import uiUxDesign from "./ui-ux-design.json";
import productManagement from "./product-management.json";
import blockchainWeb3 from "./blockchain-web3.json";
import quantumComputing from "./quantum-computing.json";
import robotics from "./robotics.json";
import arVr from "./ar-vr.json";
import greenTech from "./green-tech.json";
import embeddedIot from "./embedded-iot.json";
import fintechEngineering from "./fintech-engineering.json";
import aiGovernance from "./ai-governance.json";

/**
 * All career fields in their default ("featured") display order.
 * JSON imports widen string literals, so each file is asserted to `Field`;
 * `tests/data.test.ts` validates the real shape at test time.
 */
export const fields: Field[] = [
  aiAgents,
  machineLearning,
  dataScience,
  cybersecurity,
  cloudEngineering,
  dataEngineering,
  devopsPlatform,
  fullStackWeb,
  mobileDevelopment,
  uiUxDesign,
  productManagement,
  promptEngineering,
  aiGovernance,
  fintechEngineering,
  embeddedIot,
  greenTech,
  robotics,
  arVr,
  blockchainWeb3,
  quantumComputing,
] as Field[];
