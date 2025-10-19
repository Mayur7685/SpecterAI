export type NicheId =
  | "general"
  | "fintech"
  | "web3"
  | "healthcare"
  | "saas";

export interface NicheProfile {
  id: NicheId;
  name: string;
  icon: string;
  description: string;
  focusAreas: string[];
  regulations: string[];
  promptTemplate: (sectionName: string, sectionContent: string) => string;
  riskBands: {
    low: string;
    medium: string;
    high: string;
  };
  defaultConfidence: number;
}

export const DEFAULT_NICHE_ID: NicheId = "general";

const generalPrompt = (sectionName: string, sectionContent: string) => `You are a legal and compliance analyst AI specializing in Terms & Conditions analysis.

Analyze the following Terms & Conditions section and provide a structured analysis.

Section: "${sectionName}"
Content: "${sectionContent}"

Provide your analysis in the following JSON format:
{
  "sectionName": "${sectionName}",
  "summary": "Brief plain-English explanation of what this section means",
  "pros": ["Positive aspect 1", "Positive aspect 2", "Positive aspect 3"],
  "cons": ["Concerning aspect 1", "Concerning aspect 2", "Concerning aspect 3"],
  "problematicClauses": ["Specific problematic clause or practice"],
  "riskScore": 5,
  "suggestions": ["Improvement suggestion 1", "Improvement suggestion 2"],
  "confidenceScore": 0.85
}

Focus on:
- User rights and protections
- Data privacy compliance (GDPR, CCPA)
- Fairness and transparency
- Legal enforceability
- Consumer protection compliance

Risk Score: 1-10 (1=very safe, 10=high risk for users)`;

const fintechPrompt = (sectionName: string, sectionContent: string) => `You are a FinTech legal compliance AI specializing in analyzing financial agreements and data policies.

Analyze the following section of a FinTech legal document for compliance with:
- KYC / AML regulations
- GDPR and financial data handling standards
- Consumer protection and fair lending practices

Section: "${sectionName}"
Content: "${sectionContent}"

Provide your analysis in this JSON format:
{
  "sectionName": "${sectionName}",
  "summary": "...",
  "pros": [],
  "cons": [],
  "problematicClauses": [],
  "riskScore": 0,
  "suggestions": [],
  "confidenceScore": 0.85
}

Emphasize:
- Transparency of financial terms
- Data sharing and consent
- Risk of regulatory non-compliance
- Clarity for users on fees, rights, and obligations

Risk Score: 1-10 (1=fully compliant, 10=severe risk)`;

const web3Prompt = (sectionName: string, sectionContent: string) => `You are a Web3 legal analyst specializing in blockchain, DeFi, and token-related agreements.

Analyze the following section for:
- Regulatory compliance (MiCA, SEC, FCA)
- Risks of misleading financial claims
- Smart contract liability disclaimers
- User protection in decentralized environments

Section: "${sectionName}"
Content: "${sectionContent}"

Return JSON with:
{
  "sectionName": "${sectionName}",
  "summary": "...",
  "pros": [],
  "cons": [],
  "problematicClauses": [],
  "riskScore": 0,
  "suggestions": [],
  "confidenceScore": 0.85
}

Highlight:
- Securities implications (Howey Test)
- Token economics clarity
- DAO / governance disclosures
- Jurisdictional disclaimers

Risk Score: 1-10 (1=fully compliant, 10=high enforcement exposure)`;

const healthcarePrompt = (sectionName: string, sectionContent: string) => `You are a Healthcare compliance AI focused on HIPAA, GDPR, and medical data governance.

Analyze the following section for:
- Protected health information (PHI) handling
- Patient consent and data sharing
- Security safeguards and breach notification
- Alignment with HIPAA Privacy & Security Rules

Section: "${sectionName}"
Content: "${sectionContent}"

Return JSON with:
{
  "sectionName": "${sectionName}",
  "summary": "...",
  "pros": [],
  "cons": [],
  "problematicClauses": [],
  "riskScore": 0,
  "suggestions": [],
  "confidenceScore": 0.85
}

Emphasize:
- Minimum necessary data usage
- Patient rights (access, amendment, accounting)
- Business Associate responsibilities
- Cross-border data transfer controls

Risk Score: 1-10 (1=low compliance risk, 10=critical compliance failure)`;

const saasPrompt = (sectionName: string, sectionContent: string) => `You are a SaaS legal compliance AI focusing on subscription software agreements.

Analyze the section for:
- Service level transparency and uptime commitments
- Data portability and deletion rights
- Fair billing, renewal, and termination clauses
- IP ownership and customer responsibilities

Section: "${sectionName}"
Content: "${sectionContent}"

Respond with JSON:
{
  "sectionName": "${sectionName}",
  "summary": "...",
  "pros": [],
  "cons": [],
  "problematicClauses": [],
  "riskScore": 0,
  "suggestions": [],
  "confidenceScore": 0.85
}

Focus on:
- Clarity for customers
- Data handling transparency
- Liability limitations and indemnities
- Termination flexibility

Risk Score: 1-10 (1=low customer risk, 10=high customer risk)`;

const PROFILES: Record<NicheId, NicheProfile> = {
  general: {
    id: "general",
    name: "General Compliance",
    icon: "⚖️",
    description: "Broad legal compliance analysis across consumer-facing documents.",
    focusAreas: [
      "User rights and protections",
      "Privacy and data usage",
      "Fairness and transparency",
      "Consumer protection",
      "Legal enforceability"
    ],
    regulations: ["GDPR", "CCPA", "Consumer Protection"],
    promptTemplate: generalPrompt,
    riskBands: {
      low: "Low risk — statements align with common consumer protections.",
      medium: "Moderate risk — clarify obligations or privacy language.",
      high: "High risk — clauses may be unenforceable or unfair to users."
    },
    defaultConfidence: 0.85
  },
  fintech: {
    id: "fintech",
    name: "FinTech & Banking",
    icon: "💳",
    description: "Assess lending, payments, and financial data compliance.",
    focusAreas: [
      "KYC / AML controls",
      "Financial data handling",
      "Fair lending and transparency",
      "Fee disclosures",
      "Consumer finance protections"
    ],
    regulations: ["KYC/AML", "GDPR", "Consumer Finance", "FATF"],
    promptTemplate: fintechPrompt,
    riskBands: {
      low: "Low AML risk — disclosures and controls look sound.",
      medium: "Moderate AML/Data risk — tighten consent or monitoring.",
      high: "High enforcement risk — potential AML/GDPR violations detected."
    },
    defaultConfidence: 0.85
  },
  web3: {
    id: "web3",
    name: "Web3 & DeFi",
    icon: "🪙",
    description: "Review token terms, staking, and decentralized protocols.",
    focusAreas: [
      "Securities and token disclosures",
      "Smart contract liability",
      "DeFi risk disclaimers",
      "Jurisdictional compliance",
      "Governance transparency"
    ],
    regulations: ["MiCA", "SEC Guidance", "Howey Test", "FCA"],
    promptTemplate: web3Prompt,
    riskBands: {
      low: "Low regulatory exposure — disclosures are transparent.",
      medium: "Moderate exposure — clarify token economics or risks.",
      high: "High enforcement risk — potential securities violations."
    },
    defaultConfidence: 0.82
  },
  healthcare: {
    id: "healthcare",
    name: "Healthcare & MedTech",
    icon: "🧬",
    description: "Evaluate PHI protection and medical data governance.",
    focusAreas: [
      "HIPAA Privacy & Security",
      "Patient consent",
      "PHI handling",
      "Breach notification",
      "Cross-border data transfers"
    ],
    regulations: ["HIPAA", "GDPR", "HITECH"],
    promptTemplate: healthcarePrompt,
    riskBands: {
      low: "Low PHI risk — safeguards and rights look sufficient.",
      medium: "Moderate PHI risk — clarify safeguards or patient rights.",
      high: "High PHI risk — potential HIPAA or GDPR violations."
    },
    defaultConfidence: 0.86
  },
  saas: {
    id: "saas",
    name: "SaaS & B2B",
    icon: "🛠️",
    description: "Focus on subscription software, SLAs, and customer rights.",
    focusAreas: [
      "Service level commitments",
      "Billing and renewals",
      "Data portability",
      "IP and licensing",
      "Termination rights"
    ],
    regulations: ["GDPR", "Consumer Contract", "Service Level Standards"],
    promptTemplate: saasPrompt,
    riskBands: {
      low: "Low customer risk — terms are transparent and fair.",
      medium: "Moderate customer risk — clarify renewal or data rights.",
      high: "High customer risk — clauses may be one-sided or unclear."
    },
    defaultConfidence: 0.84
  }
};

export const NICHE_PROFILES: NicheProfile[] = Object.values(PROFILES);

export function getNicheProfile(nicheId?: string | null): NicheProfile {
  if (!nicheId) {
    return PROFILES[DEFAULT_NICHE_ID];
  }
  const normalized = nicheId.toLowerCase() as NicheId;
  return PROFILES[normalized] ?? PROFILES[DEFAULT_NICHE_ID];
}

export function getRiskNarrative(profile: NicheProfile, riskScore: number): string {
  if (riskScore <= 3) {
    return profile.riskBands.low;
  }
  if (riskScore <= 6) {
    return profile.riskBands.medium;
  }
  return profile.riskBands.high;
}
