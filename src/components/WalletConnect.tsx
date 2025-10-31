'use client';

import { useWallet } from '@/contexts/WalletContext';

export default function WalletConnect() {
  const { account, isConnected, isConnecting, error, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-3">
      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 max-w-xs">
          {error}
        </div>
      )}
      
      {isConnected && account ? (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              {formatAddress(account)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${isConnecting
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {isConnecting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            'Connect Wallet'
          )}
        </button>
      )}
    </div>
  );
}
