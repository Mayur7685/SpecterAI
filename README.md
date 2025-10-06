# ⚖️ Specter AI - AI-Powered Legal Analysis

Specter AI is an AI-powered legal compliance agent inspired by Suits’ Harvey Specter. It analyzes Terms & Conditions, Privacy Policies, and other legal documents to uncover risks, ensure GDPR compliance, and deliver actionable insights all powered by the decentralized 0G Compute Network.

## 🚀 Features

- **📄 Document Upload**: Support for TXT, PDF, and Markdown files
- **🤖 AI Analysis**: Powered by 0G Compute Network's GPT-OSS-120B model
- **📊 Risk Assessment**: Section-by-section analysis with 1-10 risk scoring
- **⚖️ Compliance Check**: GDPR, consumer rights, and legal compliance analysis
- **📋 Detailed Reports**: Comprehensive analysis with pros, cons, and recommendations
- **💾 Export Reports**: Download analysis results as Markdown files
- **🎨 Modern UI**: Beautiful, responsive interface with dark mode support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI/Blockchain**: 0G Compute Network, Ethers.js
- **File Processing**: PDF parsing, drag & drop uploads
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- 0G testnet wallet with tokens
- Private key for 0G network access

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the project
cd legal-agent

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# 0G Network Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://evmrpc-testnet.0g.ai
PROVIDER_GPT_OSS_120B=0xf07240Efa67755B5311bc75784a061eDB47165Dd
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 How to Use

1. **Upload Document**: Drag & drop or click to upload your T&C document (TXT, PDF, or MD)
2. **Start Analysis**: Click "Analyze Document" to begin AI processing
3. **Review Results**: Get detailed section-by-section analysis with risk scores
4. **Download Report**: Export the complete analysis as a Markdown file

## 🔍 What Gets Analyzed

- **GDPR Compliance**: Data protection and privacy rights
- **Consumer Rights**: Fair terms and user protections  
- **Risk Assessment**: Problematic clauses and legal issues
- **Plain Language**: Convert legal jargon to understandable explanations
- **Recommendations**: Specific suggestions for improvement

## 🏗️ Project Structure

```
legal-agent/
├── src/
│   ├── app/
│   │   ├── api/analyze/route.ts    # Analysis API endpoint
│   │   └── page.tsx                # Main application page
│   ├── components/
│   │   ├── FileUpload.tsx          # File upload component
│   │   ├── AnalysisResults.tsx     # Results display
│   │   └── LoadingSpinner.tsx      # Loading component
│   └── lib/
│       └── tc-analyzer.ts          # 0G Compute integration
├── .env.local                      # Environment variables
└── next.config.js                  # Next.js configuration
```

## 🔧 API Endpoints

### POST `/api/analyze`

Analyzes uploaded documents using 0G Compute Network.

**Request**: FormData with file
**Response**: ComplianceReport JSON

```typescript
interface ComplianceReport {
  documentTitle: string;
  overallRiskScore: number;
  sections: AnalysisResult[];
  criticalIssues: string[];
  recommendations: string[];
  analysisDate: string;
}
```

## 🎯 Risk Scoring

- **1-3**: 🟢 Low Risk - Well-structured and user-friendly
- **4-6**: 🟡 Moderate Risk - Some areas need attention
- **7-10**: 🔴 High Risk - Multiple concerning clauses

## 💰 Cost & Usage

- Uses 0G testnet tokens for AI inference
- Automatic account management and funding
- Cost-effective compared to traditional legal review
- Pay-per-analysis model

## 🔒 Security & Privacy

- Documents processed on decentralized 0G network
- No permanent storage of uploaded files
- Private key encryption for blockchain transactions
- GDPR-compliant data handling

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### Environment Variables for Production

Set these in your deployment platform:

- `PRIVATE_KEY`: Your 0G wallet private key
- `RPC_URL`: 0G network RPC endpoint
- `PROVIDER_GPT_OSS_120B`: GPT model provider address

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

## 📚 Learn More

- [0G Compute Network Documentation](https://docs.0g.ai)
- [Next.js Documentation](https://nextjs.org/docs)
- [0G SDK Examples](https://github.com/0gfoundation/compute-examples)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Powered by 0G Compute Network** 🚀  
*"I don't have dreams, I have goals." - Harvey Specter*
