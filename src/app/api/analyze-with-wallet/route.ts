import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import OpenAI from 'openai';
import { getNicheProfile, getRiskNarrative, DEFAULT_NICHE_ID } from '@/lib/niches';

const CONFIG = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://evmrpc-testnet.0g.ai",
  PROVIDER_ADDRESS: process.env.NEXT_PUBLIC_PROVIDER_GPT_OSS_120B || "0xf07240Efa67755B5311bc75784a061eDB47165Dd"
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privateKey, documentText, fileName, nicheId } = body;

    if (!privateKey || !documentText) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create wallet from private key
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Initializing 0G broker for wallet: ${wallet.address}`);

    // Initialize broker
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const broker: any = await createZGComputeNetworkBroker(wallet);

    // Setup account
    try {
      const account = await broker.ledger.getLedger();
      const currentBalance = parseFloat(ethers.formatEther(account.totalBalance));
      console.log(`Current balance: ${currentBalance} 0G`);

      if (currentBalance < 0.1) {
        console.log("Adding funds...");
        await broker.ledger.depositFund(1);
      }
    } catch {
      console.log("Creating new account...");
      await broker.ledger.addLedger(1);
    }

    // Re-verify provider
    await broker.inference.acknowledgeProviderSigner(CONFIG.PROVIDER_ADDRESS);

    // Setup OpenAI client
    const { endpoint } = await broker.inference.getServiceMetadata(CONFIG.PROVIDER_ADDRESS);
    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: "",
    });

    // Get niche profile
    const profile = getNicheProfile(nicheId ?? DEFAULT_NICHE_ID);

    // Split document into sections
    const sections = splitIntoSections(documentText);

    // Analyze each section
    const analysisResults = [];
    for (const section of sections) {
      const result = await analyzeSection(
        section.name,
        section.content,
        profile,
        broker,
        openai
      );
      analysisResults.push(result);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Calculate overall scores
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
      result.suggestions.forEach((suggestion: string) => {
        if (suggestion && !recommendations.includes(suggestion)) {
          recommendations.push(suggestion);
        }
      });
    });

    const report = {
      documentTitle: fileName || "Document",
      overallRiskScore,
      overallConfidenceScore,
      sections: analysisResults,
      criticalIssues,
      recommendations: recommendations.slice(0, 5),
      analysisDate: new Date().toISOString(),
      niche: {
        id: profile.id,
        name: profile.name,
        icon: profile.icon,
        regulations: profile.regulations,
        focusAreas: profile.focusAreas
      }
    };

    // Check balance
    const account = await broker.ledger.getLedger();
    const balance = ethers.formatEther(account.totalBalance);
    console.log(`Remaining balance: ${balance} 0G`);

    return NextResponse.json(report);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

function splitIntoSections(document: string): { name: string; content: string }[] {
  const sections: { name: string; content: string }[] = [];
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

  if (sections.length === 0) {
    const chunks = chunkText(document, 1000);
    chunks.forEach((chunk, index) => {
      sections.push({
        name: `Section ${index + 1}`,
        content: chunk
      });
    });
  }

  return sections.slice(0, 10);
}

function chunkText(text: string, maxLength: number): string[] {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function analyzeSection(sectionName: string, sectionContent: string, profile: any, broker: any, openai: OpenAI) {
  const prompt = profile.promptTemplate(sectionName, sectionContent);

  try {
    const messages = [{ role: "user" as const, content: prompt }];
    const headers = await broker.inference.getRequestHeaders(
      CONFIG.PROVIDER_ADDRESS,
      JSON.stringify(messages)
    );

    const completion = await openai.chat.completions.create({
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

    await broker.inference.processResponse(
      CONFIG.PROVIDER_ADDRESS,
      response,
      completion.id
    );

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          sectionName: result.sectionName ?? sectionName,
          summary: result.summary ?? "",
          pros: Array.isArray(result.pros) ? result.pros : [],
          cons: Array.isArray(result.cons) ? result.cons : [],
          problematicClauses: Array.isArray(result.problematicClauses) ? result.problematicClauses : [],
          riskScore: typeof result.riskScore === "number" ? result.riskScore : 5,
          confidenceScore: typeof result.confidenceScore === "number" ? result.confidenceScore : profile.defaultConfidence,
          suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
          nicheId: profile.id,
          regulations: profile.regulations,
          focusAreas: profile.focusAreas,
          riskNarrative: getRiskNarrative(profile, typeof result.riskScore === "number" ? result.riskScore : 5)
        };
      }
    } catch {
      // Fallback
    }

    return {
      sectionName,
      summary: response.substring(0, 200) + "...",
      pros: ["Analysis completed"],
      cons: ["Unable to parse structured response"],
      problematicClauses: [],
      riskScore: 5,
      confidenceScore: 0.5,
      suggestions: ["Review section manually"],
      nicheId: profile.id,
      regulations: profile.regulations,
      focusAreas: profile.focusAreas,
      riskNarrative: getRiskNarrative(profile, 5)
    };

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
      nicheId: profile.id,
      regulations: profile.regulations,
      focusAreas: profile.focusAreas,
      riskNarrative: getRiskNarrative(profile, 5)
    };
  }
}
