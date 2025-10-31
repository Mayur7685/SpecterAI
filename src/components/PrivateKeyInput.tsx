'use client';

import { useState } from 'react';

interface PrivateKeyInputProps {
  onSubmit: (privateKey: string) => void;
  onCancel: () => void;
}

export default function PrivateKeyInput({ onSubmit, onCancel }: PrivateKeyInputProps) {
  const [privateKey, setPrivateKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = () => {
    if (privateKey.trim()) {
      onSubmit(privateKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            🔐 Private Key Required
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            To use 0G Compute Network, we need your wallet&apos;s private key to sign transactions. 
            Your key is only used for this analysis and is never stored.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Private Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ Security Note:</strong> Your private key is sent securely to our server for transaction signing only. 
            It is never logged or stored. For maximum security, use a dedicated wallet with minimal funds.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!privateKey.trim()}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              privateKey.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
