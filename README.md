# ⚖️ Specter AI - AI-Powered Legal Analysis

Specter AI is an AI-powered legal compliance agent inspired by Suits’ Harvey Specter. It analyzes Terms & Conditions, Privacy Policies, and other legal documents to uncover risks, ensure GDPR compliance, and deliver actionable insights all powered by the decentralized 0G Compute Network.

- Updated Demo: [https://youtu.be/G-5tHW955PY](https://youtu.be/G-5tHW955PY)
- Previous Demo: [https://youtu.be/EexheQFSHCM](https://youtu.be/EexheQFSHCM)
- X Thread: https://x.com/0gSpecterAI/status/1984245508802838578

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

# Primary Provider (GPT-OSS-120B)
PROVIDER_GPT_OSS_120B=0xf07240Efa67755B5311bc75784a061eDB47165Dd
```

### ⚠️ **Important: 0G Compute Network Migration Update**

Following the recent 0G Compute Network migration, **all users must re-verify their provider** to continue using the service. Specter AI automatically handles this re-verification process during initialization.

**What this means:**
- The app now uses **GPT-OSS-120B** as the primary AI model
- Automatic fallback can be enabled if additional providers are configured
- The app will automatically re-verify your provider on first use
- No manual action required - it's handled seamlessly
- If you encounter provider verification errors, the app will provide clear guidance

**Technical Details:**
The re-verification uses the updated SDK method:
```javascript
await broker.inference.acknowledgeProviderSigner(providerAddress);
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

## 🔧 Troubleshooting

### Provider Verification Issues (Post-Migration)

If you encounter provider verification errors after the 0G Compute Network migration:

1. **Check your environment variables**:
   ```bash
   # Ensure these are set in .env.local
   PRIVATE_KEY=your_private_key_here
   PROVIDER_GPT_OSS_120B=0xf07240Efa67755B5311bc75784a061eDB47165Dd
   ```

2. **Verify your wallet has sufficient balance**:
   - Ensure your wallet has 0G testnet tokens
   - Use the [0G Faucet](https://faucet.0g.ai/) to get test tokens

3. **Check provider status**:
   - The default provider `0xf07240Efa67755B5311bc75784a061eDB47165Dd` should be active
   - If issues persist, try restarting the application

4. **Console logs**:
   - Check browser console for detailed error messages
   - Look for "Provider re-verification" status messages

### Common Error Messages

- **"Provider re-verification failed"**: Check your private key and provider address
- **"Broker not initialized"**: Restart the application
- **"Insufficient balance"**: Add more 0G tokens to your wallet

## 🆘 Support

- [0G Discord Community](https://discord.gg/0glabs)
- [GitHub Issues](https://github.com/your-repo/legal-agent/issues)
- [Documentation](https://docs.0g.ai)
- [0G Compute Network Migration Guide](https://docs.0g.ai/compute-network/migration)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Powered by 0G Compute Network** 🚀  
*"I don't have dreams, I have goals." - Harvey Specter*
