'use client';

import { ComplianceReport } from '@/lib/tc-analyzer';

interface AnalysisResultsProps {
  result: ComplianceReport;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
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
            <button
              onClick={downloadReport}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              📥 Download Report
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  </div>
                  <div className="ml-6 text-center bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className={`text-2xl font-bold mb-1 ${getRiskColor(section.riskScore)}`}>
                      {section.riskScore}/10
                    </div>
                    <div className={`text-xs font-medium ${getRiskColor(section.riskScore)}`}>
                      {getRiskLabel(section.riskScore)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Pros */}
                {section.pros.length > 0 && (
                  <div>
                    <h6 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      ✅ Pros
                    </h6>
                    <ul className="space-y-1">
                      {section.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                          <span className="text-green-500 mr-1">•</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cons */}
                {section.cons.length > 0 && (
                  <div>
                    <h6 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                      ❌ Concerns
                    </h6>
                    <ul className="space-y-1">
                      {section.cons.map((con, i) => (
                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                          <span className="text-red-500 mr-1">•</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Problematic Clauses */}
              {section.problematicClauses.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                  <h6 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                    ⚠️ Problematic Clauses
                  </h6>
                  <ul className="space-y-1">
                    {section.problematicClauses.map((clause, i) => (
                      <li key={i} className="text-xs text-orange-700 dark:text-orange-300">
                        • {clause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {section.suggestions.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    💡 Suggestions
                  </h6>
                  <ul className="space-y-1">
                    {section.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="text-blue-500 mr-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Analysis completed on {new Date(result.analysisDate).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Powered by Specter AI • 0G Compute Network • GPT-OSS-120B
        </p>
      </div>
    </div>
  );
}

function generateMarkdownReport(result: ComplianceReport): string {
  let report = `# 📋 T&C Compliance Analysis Report

**Document:** ${result.documentTitle}
**Overall Risk Score:** ${result.overallRiskScore}/10
**Analysis Date:** ${new Date(result.analysisDate).toLocaleDateString()}

---

## 🎯 Executive Summary

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
