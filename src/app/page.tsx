'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import AnalysisResults from '@/components/AnalysisResultsNew';
import SupportCard from '@/components/SupportCard';
import MigrationNotice from '@/components/MigrationNotice';
import NicheSelector from '@/components/NicheSelector';
import WalletConnect from '@/components/WalletConnect';
import BalanceChecker from '@/components/BalanceChecker';
import CrowdfundSupport from '@/components/CrowdfundSupport';
import { ComplianceReport } from '@/lib/tc-analyzer';
import { DEFAULT_NICHE_ID, NicheId } from '@/lib/niches';
import { useWallet } from '@/contexts/WalletContext';

export default function Home() {
  const { isConnected } = useWallet();
  const [analysisResult, setAnalysisResult] = useState<ComplianceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState<NicheId>(DEFAULT_NICHE_ID);

  const handleAnalysisComplete = (result: ComplianceReport) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
  };

  const handleAnalysisError = () => {
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚖️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Specter AI
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-Powered Legal Analysis with 0G Compute
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                  &quot;The best way to achieve impossible is to believe it is inevitable&quot;
                </p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Powered by 0G Compute Network</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Legal Document Analysis Made Simple
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Upload your Terms & Conditions, Privacy Policy, or any legal document and get instant AI-powered analysis with compliance insights and risk assessment.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Migration Notice */}
        <MigrationNotice />

        <div className="space-y-10">
          {/* Upload & Niche Selection */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  📄
                </span>
                Configure Analysis
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select a compliance focus and upload your legal document.
              </p>
            </div>
            <div className="p-6 space-y-6 lg:space-y-0 lg:flex lg:items-start lg:gap-8">
              {!isConnected ? (
                <div className="w-full text-center py-8">
                  <div className="mb-4">
                    <span className="text-4xl">🔐</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Connect your wallet to start analyzing documents with Specter AI. <strong>Analysis is FREE!</strong> Optional donations help keep the service running. 💝
                  </p>
                  <div className="flex justify-center">
                    <WalletConnect />
                  </div>
                </div>
              ) : (
                <>
                  <div className="lg:w-1/2 xl:w-5/12 space-y-4">
                    <BalanceChecker />
                    <CrowdfundSupport />
                    <NicheSelector
                      selectedNiche={selectedNiche}
                      onSelect={setSelectedNiche}
                      disabled={isAnalyzing}
                    />
                  </div>
                  <div className="lg:flex-1 w-full">
                    <FileUpload
                      onAnalysisStart={handleAnalysisStart}
                      onAnalysisComplete={handleAnalysisComplete}
                      onAnalysisError={handleAnalysisError}
                      isAnalyzing={isAnalyzing}
                      selectedNiche={selectedNiche}
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Feature Highlights */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">What Specter AI Checks</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Core compliance and risk insights included with every analysis.</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-lg">⚖️</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Compliance Check</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span>GDPR & Privacy Rights</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span>Consumer Protection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span>Legal Enforceability</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-lg">🎯</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Risk Analysis</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span>1-10 Risk Scoring</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span>Problematic Clauses</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span>Improvement Suggestions</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-lg">📊</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Niche Insights</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      <span>Industry-specific prompts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      <span>Regulation references</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      <span>Risk narratives</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Analysis States */}
          {isAnalyzing && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyzing Document...</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Specter AI is reviewing your document with 0G Compute Network.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-700 dark:text-blue-300">Processing document sections...</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Running compliance analysis...</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Generating risk assessment...</span>
                </div>
              </div>
            </section>
          )}

          {analysisResult && (
            <section>
              <AnalysisResults result={analysisResult} />
            </section>
          )}

          {!analysisResult && !isAnalyzing && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📄</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Ready for Analysis</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Upload a legal document to get started with AI-powered analysis. Specter AI will provide detailed insights and compliance recommendations.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>PDF Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>TXT & MD Files</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Up to 10MB</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Support Section */}
          <section>
            <SupportCard />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Powered by 0G Compute Network • Specter AI Legal Analysis
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Decentralized AI</span>
              <span>•</span>
              <span>Privacy-First</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
