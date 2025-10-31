'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { ethers } from 'ethers';

export default function CrowdfundSupport() {
  const { account, signer, isConnected } = useWallet();
  const [amount, setAmount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const serviceWalletAddress = process.env.NEXT_PUBLIC_SERVICE_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';

  const handleDonate = async () => {
    if (!signer || !account) {
      setError('Please connect your wallet first');
      return;
    }

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      // Send transaction to service wallet
      const tx = await signer.sendTransaction({
        to: serviceWalletAddress,
        value: ethers.parseEther(amount),
      });

      console.log('Donation transaction sent:', tx.hash);
      setTxHash(tx.hash);

      // Wait for confirmation
      await tx.wait();

      setSuccess(true);
      setAmount('1'); // Reset amount
      console.log('Donation confirmed!');
    } catch (err) {
      console.error('Donation failed:', err);
      setError(err instanceof Error ? err.message : 'Donation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <span className="text-4xl">💝</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Support Specter AI
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Help us keep the service running! Your contributions fund AI analysis for everyone. 
            <strong> Analysis is FREE</strong> - donations are optional and greatly appreciated! 🙏
          </p>

          {success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">✅</span>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Thank you for your support!
                </p>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                Your donation of {amount} 0G has been received. You&apos;re awesome! 🎉
              </p>
              {txHash && (
                <a
                  href={`https://chainscan-newton.0g.ai/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 dark:text-green-400 hover:underline mt-2 inline-block"
                >
                  View transaction →
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Donation Amount (0G)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="1.0"
                  />
                </div>
                <div className="pt-6">
                  <button
                    onClick={handleDonate}
                    disabled={isLoading || !amount}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isLoading || !amount
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sending...</span>
                      </span>
                    ) : (
                      '💝 Donate'
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-800 dark:text-red-200">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAmount('0.5')}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 transition-colors disabled:opacity-50"
                >
                  0.5 0G
                </button>
                <button
                  onClick={() => setAmount('1')}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 transition-colors disabled:opacity-50"
                >
                  1 0G
                </button>
                <button
                  onClick={() => setAmount('5')}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 transition-colors disabled:opacity-50"
                >
                  5 0G
                </button>
              </div>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>💡 Why donate?</strong> Your contributions help cover AI compute costs and keep Specter AI free for everyone!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
