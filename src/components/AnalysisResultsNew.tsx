'use client';

import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { ComplianceReport } from '@/lib/tc-analyzer';
import { getNicheProfile, getRiskNarrative } from '@/lib/niches';

interface AnalysisResultsProps {
  result: ComplianceReport;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const profile = getNicheProfile(result.niche?.id);
  const overallRiskNarrative = getRiskNarrative(profile, result.overallRiskScore);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [nftImage, setNftImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [minted, setMinted] = useState(false);

  const focusTags = useMemo(() => profile.focusAreas.slice(0, 4), [profile]);
  const regulationTags = useMemo(() => profile.regulations.slice(0, 4), [profile]);

  const uniquePrompt = useMemo(() => `Create a futuristic legal compliance guardian illustration representing ${profile.name}. Highlight trust, decentralized AI, and the following focus areas: ${focusTags.join(', ')}.`, [profile, focusTags]);

  useEffect(() => {
    if (!showNFTModal) {
      return;
    }

    const generateMockImage = () => {
      setIsGeneratingImage(true);
      requestAnimationFrame(() => {
        const canvas = document.createElement('canvas');
        const width = 720;
        const height = 480;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setIsGeneratingImage(false);
          return;
        }

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(0.5, '#312e81');
        gradient.addColorStop(1, '#6d28d9');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const x = 80 + i * 130;
          const radius = 60 + i * 8;
          ctx.arc(x, height / 2 + Math.sin(i) * 40, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 36px "Poppins", "Segoe UI", sans-serif';
        ctx.fillText('Specter AI INFT', 40, 70);

        ctx.font = '20px "Poppins", "Segoe UI", sans-serif';
        ctx.fillText(profile.name, 40, 120);
        ctx.font = '16px "Poppins", "Segoe UI", sans-serif';
        ctx.fillText(`Confidence: ${result.overallConfidenceScore ? Math.round(result.overallConfidenceScore * 100) : 'N/A'}%`, 40, 160);
        ctx.fillText(`Risk Score: ${result.overallRiskScore}/10`, 40, 190);

        ctx.font = 'bold 18px "Poppins", "Segoe UI", sans-serif';
        ctx.fillText('Focus Highlights', 40, 230);
        ctx.font = '15px "Poppins", "Segoe UI", sans-serif';
        focusTags.forEach((tag, index) => {
          ctx.fillText(`• ${tag}`, 40, 260 + index * 24);
        });

        ctx.font = 'bold 18px "Poppins", "Segoe UI", sans-serif';
        ctx.fillText('Key Regulations', 360, 230);
        ctx.font = '15px "Poppins", "Segoe UI", sans-serif';
        regulationTags.forEach((tag, index) => {
          ctx.fillText(`• ${tag}`, 360, 260 + index * 24);
        });

        const dataUrl = canvas.toDataURL('image/png');
        setNftImage(dataUrl);
        setIsGeneratingImage(false);
      });
    };

    generateMockImage();
  }, [showNFTModal, profile, focusTags, regulationTags, result.overallConfidenceScore, result.overallRiskScore, uniquePrompt]);

  const handleDownloadNFTCard = () => {
    if (!nftImage) return;
    const link = document.createElement('a');
    link.href = nftImage;
    link.download = `specter-inft-${Date.now()}.png`;
    link.click();
  };

  const triggerConfetti = () => {
    const defaults = { spread: 360, ticks: 60, gravity: 0.7, startVelocity: 30, origin: { y: 0.6 } };
    confetti({ ...defaults, particleCount: 60, scalar: 1.2 });
    confetti({ ...defaults, particleCount: 40, scalar: 0.8 });
  };

  const handleMint = () => {
    setMinted(true);
    triggerConfetti();
    setTimeout(() => setMinted(false), 4000);
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600 dark:text-green-400';
    if (score <= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRiskBg = (score: number) => {
    if (score <= 3) return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score <= 6) return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 3) return 'Low Risk 🟢';
    if (score <= 6) return 'Moderate Risk 🟡';
    return 'High Risk 🔴';
  };

  const downloadReport = () => {
    const reportContent = generateMarkdownReport(result);
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tc-analysis-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${getRiskBg(result.overallRiskScore)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                  ✅
                </span>
                Analysis Complete
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {result.documentTitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                <span role="img" aria-hidden>{profile.icon}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {profile.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Niche Focus
              </p>
              <div className="flex items-center gap-2 ml-6">
                <button
                  onClick={downloadReport}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  📥 Download Report
                </button>
                <button
                  onClick={() => setShowNFTModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-colors"
                >
                  🎨 Generate INFT
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getRiskColor(result.overallRiskScore)}`}>
                {result.overallRiskScore}/10
              </div>
              <p className={`text-lg font-semibold mb-1 ${getRiskColor(result.overallRiskScore)}`}>
                {getRiskLabel(result.overallRiskScore)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overall Risk Score
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {result.sections.length}
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Sections
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analyzed
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {result.overallConfidenceScore ? `${Math.round(result.overallConfidenceScore * 100)}%` : 'N/A'}
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Confidence Score
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Model certainty level
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                {result.criticalIssues.length}
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Critical Issues
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Focus Areas</h4>
              <div className="flex flex-wrap gap-2">
                {profile.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="text-[11px] font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Regulations</h4>
              <div className="flex flex-wrap gap-2">
                {profile.regulations.map((reg) => (
                  <span
                    key={reg}
                    className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 px-2.5 py-1 rounded-full"
                  >
                    {reg}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Risk Interpretation</h4>
            <p>{overallRiskNarrative}</p>
          </div>
        </div>
      </div>

      {/* Critical Issues & Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Issues */}
        {result.criticalIssues.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 flex items-center">
                <span className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
                  🚨
                </span>
                Critical Issues ({result.criticalIssues.length})
              </h4>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {result.criticalIssues.map((issue, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="w-6 h-6 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-700 dark:text-red-300 text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{issue}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  💡
                </span>
                Key Recommendations
              </h4>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-700 dark:text-blue-300 text-xs">✓</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
              📊
            </span>
            Section-by-Section Analysis ({result.sections.length} sections)
          </h4>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {result.sections.map((section, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                        {index + 1}
                      </span>
                      <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {section.sectionName}
                      </h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.summary}
                    </p>
                    <p className="mt-3 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg px-3 py-2">
                      {section.riskNarrative}
                    </p>
                  </div>
                  <div className="ml-6 text-center bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className={`text-2xl font-bold mb-1 ${getRiskColor(section.riskScore)}`}>
                      {section.riskScore}/10
                    </div>
                    <div className={`text-xs font-medium ${getRiskColor(section.riskScore)}`}>
                      {getRiskLabel(section.riskScore)}
                    </div>
                    <div className="mt-2 text-xs text-purple-600 dark:text-purple-300 font-medium">
                      Confidence: {Math.round((section.confidenceScore ?? 0.5) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Pros */}
                  {section.pros.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h6 className="text-sm font-medium text-green-700 dark:text-green-300 mb-3 flex items-center">
                        <span className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-2">
                          ✅
                        </span>
                        Pros
                      </h6>
                      <ul className="space-y-2">
                        {section.pros.map((pro, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="text-green-500 mr-2 mt-1">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cons */}
                  {section.cons.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h6 className="text-sm font-medium text-red-700 dark:text-red-300 mb-3 flex items-center">
                        <span className="w-5 h-5 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-2">
                          ❌
                        </span>
                        Concerns
                      </h6>
                      <ul className="space-y-2">
                        {section.cons.map((con, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="text-red-500 mr-2 mt-1">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Problematic Clauses */}
                {section.problematicClauses.length > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <h6 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-2">
                        ⚠️
                      </span>
                      Problematic Clauses
                    </h6>
                    <ul className="space-y-2">
                      {section.problematicClauses.map((clause, i) => (
                        <li key={i} className="text-xs text-orange-700 dark:text-orange-300 flex items-start">
                          <span className="text-orange-500 mr-2 mt-1">•</span>
                          <span>{clause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {section.suggestions.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h6 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2">
                        💡
                      </span>
                      Suggestions
                    </h6>
                    <ul className="space-y-2">
                      {section.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-100 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Focus Areas Covered</h6>
                    <div className="flex flex-wrap gap-1.5">
                      {section.focusAreas.map((area) => (
                        <span key={area} className="text-[10px] font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h6 className="text-xs font-semibold text-blue-700 dark:text-blue-200 mb-1">Referenced Regulations</h6>
                    <div className="flex flex-wrap gap-1.5">
                      {section.regulations.map((reg) => (
                        <span key={reg} className="text-[10px] font-medium text-blue-700 dark:text-blue-200 bg-white dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                          {reg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Analysis completed on {new Date(result.analysisDate).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Powered by Specter AI • 0G Compute Network • GPT-OSS-120B
        </p>
      </div>

      {showNFTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowNFTModal(false)}></div>
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Specter AI Interactive NFT (Mock)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Preview the collectible card. Minting is simulated for now.</p>
              </div>
              <button
                onClick={() => setShowNFTModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close NFT preview"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/2 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-center min-h-[280px]">
                  {isGeneratingImage && (
                    <div className="flex flex-col items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                      <span>Calling Gemini... crafting artwork</span>
                    </div>
                  )}
                  {!isGeneratingImage && nftImage && (
                    <img src={nftImage} alt="Mock Specter AI INFT" className="rounded-lg shadow-lg border border-white/40" />
                  )}
                  {!isGeneratingImage && !nftImage && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Unable to generate artwork preview.</div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Specter AI • Compliance INFT</p>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{result.documentTitle || 'Legal Document'}</h4>
                      </div>
                      <span className="text-3xl" aria-hidden>{profile.icon}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-200">Risk Score</p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{result.overallRiskScore}/10</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-purple-700 dark:text-purple-200">Confidence</p>
                        <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{result.overallConfidenceScore ? `${Math.round(result.overallConfidenceScore * 100)}%` : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Focus Areas</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {focusTags.map((tag) => (
                          <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Key Regulations</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {regulationTags.map((tag) => (
                          <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                      onClick={handleMint}
                      className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${minted ? 'bg-emerald-400 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                    >
                      {minted ? 'Minted!' : 'Mint'}
                    </button>
                    <button
                      onClick={handleDownloadNFTCard}
                      disabled={!nftImage}
                      className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${nftImage ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'}`}
                    >
                      Download Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateMarkdownReport(result: ComplianceReport): string {
  const profile = getNicheProfile(result.niche?.id);
  const overallRiskNarrative = getRiskNarrative(profile, result.overallRiskScore);

  let report = `# 📋 T&C Compliance Analysis Report

**Document:** ${result.documentTitle}
**Overall Risk Score:** ${result.overallRiskScore}/10
**Overall Confidence Score:** ${result.overallConfidenceScore ? `${Math.round(result.overallConfidenceScore * 100)}%` : 'Not Available'}
**Niche:** ${profile.icon} ${profile.name}
**Analysis Date:** ${new Date(result.analysisDate).toLocaleDateString()}

---

## 🎯 Executive Summary

${overallRiskNarrative}

## 🔍 Niche Focus

**Key Focus Areas:**
${profile.focusAreas.map(area => `- ${area}`).join('\n')}

**Primary Regulations:**
${profile.regulations.map(reg => `- ${reg}`).join('\n')}

`;

  if (result.overallRiskScore <= 3) {
    report += "✅ **Low Risk** - This document appears to be well-structured and user-friendly.\n\n";
  } else if (result.overallRiskScore <= 6) {
    report += "⚠️ **Moderate Risk** - Some areas need attention for better compliance and user protection.\n\n";
  } else {
    report += "🚨 **High Risk** - Multiple concerning clauses that may disadvantage users or violate regulations.\n\n";
  }

  // Critical Issues
  if (result.criticalIssues.length > 0) {
    report += "## 🚨 Critical Issues\n\n";
    result.criticalIssues.forEach((issue, index) => {
      report += `${index + 1}. ${issue}\n`;
    });
    report += "\n";
  }

  // Section Analysis
  report += "## 📊 Section-by-Section Analysis\n\n";
  result.sections.forEach((section, index) => {
    report += `### ${index + 1}. ${section.sectionName}\n`;
    report += `**Risk Score:** ${section.riskScore}/10\n\n`;
    report += `**Confidence Score:** ${Math.round((section.confidenceScore ?? 0.5) * 100)}%\n\n`;
    report += `**Summary:** ${section.summary}\n\n`;
    
    if (section.pros.length > 0) {
      report += "**✅ Pros:**\n";
      section.pros.forEach(pro => report += `• ${pro}\n`);
      report += "\n";
    }
    
    if (section.cons.length > 0) {
      report += "**❌ Concerns:**\n";
      section.cons.forEach(con => report += `• ${con}\n`);
      report += "\n";
    }
    
    if (section.problematicClauses.length > 0) {
      report += "**⚠️ Problematic Clauses:**\n";
      section.problematicClauses.forEach(clause => report += `• ${clause}\n`);
      report += "\n";
    }

    report += "**Focus Areas Covered:**\n";
    section.focusAreas.forEach(area => report += `• ${area}\n`);
    report += "\n";

    report += "**Referenced Regulations:**\n";
    section.regulations.forEach(reg => report += `• ${reg}\n`);
    report += "\n";

    report += "---\n\n";
  });

  // Recommendations
  if (result.recommendations.length > 0) {
    report += "## 💡 Recommendations\n\n";
    result.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += "\n";
  }

  report += `
---

*Report generated by Specter AI powered by 0G Compute Network*
*AI Model: GPT-OSS-120B | Analysis Date: ${new Date(result.analysisDate).toLocaleString()}*
`;

  return report;
}
