'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { ethers } from 'ethers';

export default function BalanceChecker() {
  const { account, provider, isConnected } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && account && provider) {
      checkBalance();
    } else {
      setBalance(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, account, provider]);

  const checkBalance = async () => {
    if (!account || !provider) return;

    setIsLoading(true);
    setError(null);

    try {
      const balance = await provider.getBalance(account);
      const balanceInEth = ethers.formatEther(balance);
      setBalance(balanceInEth);
    } catch (err) {
      console.error('Failed to check balance:', err);
      setError('Failed to check balance');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Your Wallet Balance
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            0G Testnet Tokens
          </p>
        </div>
        <div className="text-right">
          {isLoading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : error ? (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : balance !== null ? (
            <>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {parseFloat(balance).toFixed(4)} 0G
              </div>
              <a
                href="https://faucet.0g.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Get more tokens →
              </a>
            </>
          ) : null}
        </div>
      </div>

      {balance !== null && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>💡 Analysis is FREE!</strong> No tokens required. Optional donations help keep the service running for everyone.
          </p>
        </div>
      )}
    </div>
  );
}
