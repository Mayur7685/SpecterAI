import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";

// Configuration
const CONFIG = {
  RPC_URL: process.env.RPC_URL || "https://evmrpc-testnet.0g.ai",
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  PROVIDER_ADDRESS: process.env.PROVIDER_GPT_OSS_120B || "0xf07240Efa67755B5311bc75784a061eDB47165Dd"
};

export interface AnalysisResult {
  sectionName: string;
  summary: string;
  pros: string[];
  cons: string[];
  problematicClauses: string[];
  riskScore: number;
  suggestions: string[];
}

export interface ComplianceReport {
  documentTitle: string;
  overallRiskScore: number;
  sections: AnalysisResult[];
  criticalIssues: string[];
  recommendations: string[];
  analysisDate: string;
}

export class TCInsightAgent {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private broker: any;
  private openai: OpenAI | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    
    if (!CONFIG.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY not found in environment variables");
    }
    
    this.wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, this.provider);
  }

  async initialize(): Promise<void> {
    try {
      // Initialize broker
      this.broker = await createZGComputeNetworkBroker(this.wallet);
      
      // Setup account if needed
      await this.setupAccount();
      
      // Acknowledge provider
      await this.broker.inference.acknowledgeProviderSigner(CONFIG.PROVIDER_ADDRESS);
      
      // Setup OpenAI client
      const { endpoint, model } = await this.broker.inference.getServiceMetadata(CONFIG.PROVIDER_ADDRESS);
      this.openai = new OpenAI({
        baseURL: endpoint,
        apiKey: "",
      });
      
    } catch (error) {
      console.error("Failed to initialize agent:", error);
      throw error;
    }
  }

  private async setupAccount(): Promise<void> {
    try {
      const account = await this.broker.ledger.getLedger();
      const currentBalance = parseFloat(ethers.formatEther(account.totalBalance));
      
      if (currentBalance < 1) {
        await this.broker.ledger.depositFund(1);
      }
    } catch (error) {
      await this.broker.ledger.addLedger(1);
    }
  }

  // Split document into logical sections
  splitIntoSections(document: string): { name: string; content: string }[] {
    const sections: { name: string; content: string }[] = [];
    
    // Split by common section headers or numbered sections
    const parts = document.split(/(?=(?:^|\n)\s*(?:\d+\.?\s*)?[A-Z][A-Z\s]{10,})/);
    
    parts.forEach((part, index) => {
      if (part.trim().length > 50) { // Only include substantial sections
        const lines = part.trim().split('\n');
        const title = lines[0].trim() || `Section ${index + 1}`;
        const content = lines.slice(1).join('\n').trim();
        
        if (content.length > 20) {
          sections.push({
            name: title.substring(0, 100), // Limit title length
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

    return sections.slice(0, 10); // Limit to 10 sections for cost control
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

  async analyzeSection(sectionName: string, sectionContent: string): Promise<AnalysisResult> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized");
    }

    const prompt = `You are a legal and compliance analyst AI specializing in Terms & Conditions analysis.

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
  "suggestions": ["Improvement suggestion 1", "Improvement suggestion 2"]
}

Focus on:
- User rights and protections
- Data privacy compliance (GDPR, CCPA)
- Fairness and transparency
- Legal enforceability
- Consumer protection compliance

Risk Score: 1-10 (1=very safe, 10=high risk for users)`;

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
          return result as AnalysisResult;
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        // Fallback: create structured result from text response
        return {
          sectionName,
          summary: response.substring(0, 200) + "...",
          pros: ["Analysis completed"],
          cons: ["Unable to parse structured response"],
          problematicClauses: [],
          riskScore: 5,
          suggestions: ["Review section manually"]
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
        suggestions: ["Retry analysis"]
      };
    }
  }

  async analyzeDocument(document: string, title: string = "Terms & Conditions"): Promise<ComplianceReport> {
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
      sections: analysisResults,
      criticalIssues,
      recommendations: recommendations.slice(0, 5),
      analysisDate: new Date().toISOString()
    };
  }

  async checkBalance(): Promise<string> {
    const account = await this.broker.ledger.getLedger();
    return ethers.formatEther(account.totalBalance);
  }
}
