'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { constants, RpcProvider } from 'starknet';

// Avoid SSR issues
type SessionAccountInterface = unknown;

// Import browser-only modules
let getStarknet: unknown = null;

interface WalletContextType {
    isLoading: boolean;
    account: SessionAccountInterface | null;
    address: string | null;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [account, setAccount] = useState<SessionAccountInterface | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    // Initialize client-side only modules
    useEffect(() => {
        setIsClient(true);

        const initStarknet = async () => {
            try {
                setIsLoading(true);
                if (typeof window !== 'undefined' && (window as { starknet?: unknown }).starknet) {
                    getStarknet = (window as { starknet?: unknown }).starknet;
                    const wasConnected = localStorage.getItem('wallet_connected') === 'true';
                    if (wasConnected) {
                        // Always call enable to restore session
                        try {
                            await (getStarknet as { enable: (options: { starknetVersion: string }) => Promise<unknown> }).enable({ starknetVersion: "v5" });
                            if ((getStarknet as { account?: { address?: string } }).account && (getStarknet as { account?: { address?: string } }).account?.address) {
                                setAccount((getStarknet as { account: unknown }).account);
                                setAddress((getStarknet as { account: { address: string } }).account.address);
                                setIsConnected(true);
                            }
                        } catch {
                            // If enable fails, clear the flag
                            localStorage.removeItem('wallet_connected');
                            setIsConnected(false);
                            setAccount(null);
                            setAddress(null);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to initialize Starknet:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Set a timeout to ensure loading doesn't get stuck
        const timeout = setTimeout(() => {
            console.warn('Wallet initialization timeout - forcing loading to false');
            setIsLoading(false);
        }, 10000);

        initStarknet();

        // Cleanup timeout on component unmount
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, []);

    // Initialize provider in client environment
    const provider = isClient
        ? new RpcProvider({
            nodeUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/kwgGr9GGk4YyLXuGfEvpITv1jpvn3PgP",
            chainId: constants.StarknetChainId.SN_SEPOLIA,
        })
        : null;

    const connectWallet = async () => {
        if (!getStarknet || !provider) {
            alert("Please install ArgentX or Braavos wallet extension first!");
            return;
        }

        setIsLoading(true);
        try {
            // Request connection to the wallet
            const result = await (getStarknet as { enable: (options: { starknetVersion: string }) => Promise<unknown> }).enable({ starknetVersion: "v5" });

            if (result && Array.isArray(result) && result.length > 0) {
                const account = (getStarknet as { account: unknown }).account;

                // Ensure the account is properly configured with the provider
                if (account && (account as { address?: string }).address) {
                    console.log('Wallet connected:', {
                        address: (account as { address: string }).address,
                        chainId: await (account as { getChainId?: () => Promise<string> }).getChainId?.() || 'unknown'
                    });

                    setAccount(account);
                    setAddress((account as { address: string }).address);
                    setIsConnected(true);
                    localStorage.setItem('wallet_connected', 'true');
                } else {
                    throw new Error('No account found after wallet connection');
                }
            } else {
                throw new Error('Wallet connection was rejected or failed');
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert('Failed to connect wallet. Please make sure you have ArgentX or Braavos installed and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const disconnectWallet = async () => {
        if (!getStarknet) return;

        try {
            // Clear the connection
            setAccount(null);
            setAddress(null);
            setIsConnected(false);
            localStorage.removeItem('wallet_connected');
        } catch (error) {
            console.error('Failed to disconnect:', error);
        }
    };

    const value: WalletContextType = {
        isLoading,
        account,
        address,
        isConnected,
        connect: connectWallet,
        disconnect: disconnectWallet,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
} 