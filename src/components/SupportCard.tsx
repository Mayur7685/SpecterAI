'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function SupportCard() {
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<string>('Loading...');
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const agentAddress = '0x317987A491E3042Da60F06F7eCC7551e820C9F28';

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(agentAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const openFaucet = () => {
    window.open('https://faucet.0g.ai/', '_blank');
  };

  const openBlockExplorer = () => {
    window.open(`https://chainscan-newton.0g.ai/address/${agentAddress}`, '_blank');
  };

  const checkBalance = async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://evmrpc-testnet.0g.ai');
      const balanceWei = await provider.getBalance(agentAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance('Error');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    checkBalance();
    // Refresh balance every 30 seconds
    const interval = setInterval(checkBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl">💎</span>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Support Specter AI
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Help keep Specter AI running by contributing 0G tokens. 
            Your support enables more users to access free legal document analysis.
          </p>
          
          {/* Agent Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Specter AI Wallet Address</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                  {agentAddress}
                </p>
              </div>
              <button
                onClick={copyAddress}
                className="ml-3 px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <button
              onClick={openBlockExplorer}
              className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center space-x-1"
            >
              <span>🔍</span>
              <span>View on Block Explorer</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={openFaucet}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>🚰</span>
              <span>Get 0G Tokens (Faucet)</span>
            </button>
            
            <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Specter AI Balance</p>
                <div className="flex items-center justify-center space-x-2">
                  {isLoadingBalance && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                  )}
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {balance} OG
                  </p>
                  <button
                    onClick={checkBalance}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Refresh balance"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 text-sm">ℹ️</span>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Get free 0G tokens from the faucet</li>
                  <li>• Send tokens to the agent address above</li>
                  <li>• Helps fund AI inference costs for all users</li>
                  <li>• Keeps the service free and accessible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
