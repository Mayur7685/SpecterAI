'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const isConnected = !!account;

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      const ethereum = window.ethereum;
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  async function checkConnection() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.listAccounts();
        if (accounts.length > 0) {
          const userSigner = await browserProvider.getSigner();
          setAccount(accounts[0].address);
          setProvider(browserProvider);
          setSigner(userSigner);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
  }

  async function connectWallet() {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await browserProvider.send('eth_requestAccounts', []);
      
      const userSigner = await browserProvider.getSigner();
      const address = await userSigner.getAddress();
      
      setAccount(address);
      setProvider(browserProvider);
      setSigner(userSigner);
      
      console.log('Wallet connected:', address);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnectWallet() {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setError(null);
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        provider,
        signer,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
