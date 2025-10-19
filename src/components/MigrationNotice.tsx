'use client';

import { useState } from 'react';

export default function MigrationNotice() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-blue-600 dark:text-blue-400 text-sm">ℹ️</span>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            0G Compute Network Migration Update
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Following the recent 0G Compute Network migration, Specter AI now uses <strong>GPT-OSS-120B</strong> as 
            the primary AI model with automatic fallback available if additional providers come online. Provider re-verification happens seamlessly 
            during your first analysis.
          </p>
          <div className="flex items-center space-x-4 text-xs text-blue-600 dark:text-blue-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>GPT-OSS-120B Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Auto-fallback Ready</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 transition-colors"
          aria-label="Dismiss notice"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
