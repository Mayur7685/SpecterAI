import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";
import {
  DEFAULT_NICHE_ID,
  getNicheProfile,
  getRiskNarrative,
  NicheId,
  NicheProfile
} from "./niches";

// Configuration
const CONFIG = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://evmrpc-testnet.0g.ai",
  PROVIDER_ADDRESS: process.env.NEXT_PUBLIC_PROVIDER_GPT_OSS_120B || "0xf07240Efa67755B5311bc75784a061eDB47165Dd"
};

export interface AnalysisResult {
  sectionName: string;
  summary: string;
  pros: string[];
  cons: string[];
  problematicClauses: string[];
  riskScore: number;
  confidenceScore: number;
  suggestions: string[];
  nicheId: NicheId;
  regulations: string[];
  focusAreas: string[];
  riskNarrative: string;
}

export interface ComplianceReport {
  documentTitle: string;
  overallRiskScore: number;
  overallConfidenceScore: number;
  sections: AnalysisResult[];
  criticalIssues: string[];
  recommendations: string[];
  analysisDate: string;
  niche: {
    id: NicheId;
    name: string;
    icon: string;
    regulations: string[];
    focusAreas: string[];
  };
}

export class TCInsightAgentClient {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | ethers.JsonRpcSigner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private broker: any = null;
  private openai: OpenAI | null = null;
  private profile: NicheProfile = getNicheProfile(DEFAULT_NICHE_ID);

  constructor(signer: ethers.Wallet | ethers.JsonRpcSigner) {
    this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    this.wallet = signer;
  }

  async initialize(): Promise<void> {
    try {
      console.log("Initializing 0G Compute Network broker with user wallet...");
      // Initialize broker with user's wallet
      this.broker = await createZGComputeNetworkBroker(this.wallet);
      
      // Setup account if needed
      console.log("Setting up account...");
      await this.setupAccount();
      
      // Re-verify provider
      console.log(`Re-verifying provider: ${CONFIG.PROVIDER_ADDRESS} (GPT-OSS-120B)`);
      await this.broker.inference.acknowledgeProviderSigner(CONFIG.PROVIDER_ADDRESS);
      console.log("Provider re-verification successful with GPT-OSS-120B");
      
      // Setup OpenAI client
      console.log("Setting up AI client...");
      const { endpoint } = await this.broker.inference.getServiceMetadata(CONFIG.PROVIDER_ADDRESS);
      this.openai = new OpenAI({
        baseURL: endpoint,
        apiKey: "",
      });
      
      console.log("Specter AI initialization complete");
      
    } catch (error) {
      console.error("Failed to initialize Specter AI:", error);
      throw error;
    }
  }

  private async setupAccount(): Promise<void> {
    if (!this.broker) throw new Error("Broker not initialized");
    
    try {
      const account = await this.broker.ledger.getLedger();
      const currentBalance = parseFloat(ethers.formatEther(account.totalBalance));
      console.log(`Current account balance: ${currentBalance} 0G tokens`);
      
      if (currentBalance < 0.1) {
        console.log("Adding funds to account...");
        await this.broker.ledger.depositFund(1);
        console.log("Added 1 0G token to account");
      }
    } catch {
      console.log("Creating new account with 1 0G token...");
      await this.broker.ledger.addLedger(1);
      console.log("Account created successfully");
    }
  }

  // Split document into logical sections
  splitIntoSections(document: string): { name: string; content: string }[] {
    const sections: { name: string; content: string }[] = [];
    
    // Split by common section headers or numbered sections
    const parts = document.split(/(?=(?:^|\n)\s*(?:\d+\.?\s*)?[A-Z][A-Z\s]{10,})/);
    
    parts.forEach((part, index) => {
      if (part.trim().length > 50) {
        const lines = part.trim().split('\n');
        const title = lines[0].trim() || `Section ${index + 1}`;
        const content = lines.slice(1).join('\n').trim();
        
        if (content.length > 20) {
          sections.push({
            name: title.substring(0, 100),
            content: content
          });
        }
      }
    });

    // If no clear sections found, create chunks
    if (sections.length === 0) {
      const chunks = this.chunkText(document, 1000);
      chunks.forEach((chunk, index) => {
        sections.push({
          name: `Section ${index + 1}`,
          content: chunk
        });
      });
    }

    return sections.slice(0, 10);
  }

  private chunkText(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '.';
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  setNiche(nicheId: string | undefined | null): void {
    this.profile = getNicheProfile(nicheId ?? DEFAULT_NICHE_ID);
  }

  async analyzeSection(sectionName: string, sectionContent: string): Promise<AnalysisResult> {
    if (!this.openai || !this.broker) {
      throw new Error("Client not initialized");
    }

    const prompt = this.profile.promptTemplate(sectionName, sectionContent);

    try {
      const messages = [{ role: "user" as const, content: prompt }];
      const headers = await this.broker.inference.getRequestHeaders(
        CONFIG.PROVIDER_ADDRESS,
        JSON.stringify(messages)
      );

      const completion = await this.openai.chat.completions.create({
        messages: messages,
        model: "phala/gpt-oss-120b",
        temperature: 0.3,
      }, {
        headers: headers
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("No response from AI model");
      }

      // Verify response
      await this.broker.inference.processResponse(
        CONFIG.PROVIDER_ADDRESS,
        response,
        completion.id
      );

      // Parse JSON response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          const parsed: AnalysisResult = {
            sectionName: result.sectionName ?? sectionName,
            summary: result.summary ?? "",
            pros: Array.isArray(result.pros) ? result.pros : [],
            cons: Array.isArray(result.cons) ? result.cons : [],
            problematicClauses: Array.isArray(result.problematicClauses) ? result.problematicClauses : [],
            riskScore: typeof result.riskScore === "number" ? result.riskScore : 5,
            confidenceScore: typeof result.confidenceScore === "number"
              ? result.confidenceScore
              : this.profile.defaultConfidence,
            suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
            nicheId: this.profile.id,
            regulations: this.profile.regulations,
            focusAreas: this.profile.focusAreas,
            riskNarrative: getRiskNarrative(this.profile, typeof result.riskScore === "number" ? result.riskScore : 5)
          };
          return parsed;
        } else {
          throw new Error("No JSON found in response");
        }
      } catch {
        // Fallback: create structured result from text response
        return {
          sectionName,
          summary: response.substring(0, 200) + "...",
          pros: ["Analysis completed"],
          cons: ["Unable to parse structured response"],
          problematicClauses: [],
          riskScore: 5,
          confidenceScore: 0.5,
          suggestions: ["Review section manually"],
          nicheId: this.profile.id,
          regulations: this.profile.regulations,
          focusAreas: this.profile.focusAreas,
          riskNarrative: getRiskNarrative(this.profile, 5)
        };
      }

    } catch (error) {
      console.error(`Failed to analyze section ${sectionName}:`, error);
      return {
        sectionName,
        summary: "Analysis failed",
        pros: [],
        cons: ["Analysis could not be completed"],
        problematicClauses: [],
        riskScore: 5,
        confidenceScore: 0,
        suggestions: ["Retry analysis"],
        nicheId: this.profile.id,
        regulations: this.profile.regulations,
        focusAreas: this.profile.focusAreas,
        riskNarrative: getRiskNarrative(this.profile, 5)
      };
    }
  }

  async analyzeDocument(
    document: string,
    title: string = "Terms & Conditions",
    nicheId: string | undefined | null = DEFAULT_NICHE_ID
  ): Promise<ComplianceReport> {
    this.setNiche(nicheId);

    // Split document into sections
    const sections = this.splitIntoSections(document);

    // Analyze each section
    const analysisResults: AnalysisResult[] = [];
    for (const section of sections) {
      const result = await this.analyzeSection(section.name, section.content);
      analysisResults.push(result);
      
      // Small delay to avoid overwhelming the network
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Calculate overall risk score
    const overallRiskScore = analysisResults.length > 0 
      ? Math.round(analysisResults.reduce((sum, r) => sum + r.riskScore, 0) / analysisResults.length)
      : 5;

    const overallConfidenceScore = analysisResults.length > 0
      ? Math.round((analysisResults.reduce((sum, r) => sum + (r.confidenceScore ?? 0.5), 0) / analysisResults.length) * 100) / 100
      : 0;

    // Identify critical issues
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    analysisResults.forEach(result => {
      if (result.riskScore >= 7) {
        criticalIssues.push(`High risk in ${result.sectionName}: ${result.cons[0] || 'Multiple concerns'}`);
      }
      result.suggestions.forEach(suggestion => {
        if (suggestion && !recommendations.includes(suggestion)) {
          recommendations.push(suggestion);
        }
      });
    });

    return {
      documentTitle: title,
      overallRiskScore,
      overallConfidenceScore,
      sections: analysisResults,
      criticalIssues,
      recommendations: recommendations.slice(0, 5),
      analysisDate: new Date().toISOString(),
      niche: {
        id: this.profile.id,
        name: this.profile.name,
        icon: this.profile.icon,
        regulations: this.profile.regulations,
        focusAreas: this.profile.focusAreas
      }
    };
  }

  async checkBalance(): Promise<string> {
    if (!this.broker) throw new Error("Broker not initialized");
    const account = await this.broker.ledger.getLedger();
    return ethers.formatEther(account.totalBalance);
  }
}
