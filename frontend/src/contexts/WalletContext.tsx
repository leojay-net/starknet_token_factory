'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { constants, RpcProvider, AccountInterface } from 'starknet';

// Avoid SSR issues
type SessionAccountInterface = any;
type StarknetWindowObject = any;
type ConnectedStarknetWindowObject = any;

// Import browser-only modules
let getStarknet: any = null;

const TOKEN_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS || "0x03e63a14c0048742873a97d8bba18de5cec7d54acf6f8a560b2afce3ae1ef534";

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
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize client-side only modules
    useEffect(() => {
        setIsClient(true);

        const initStarknet = async () => {
            try {
                setIsLoading(true);
                if (typeof window !== 'undefined' && (window as any).starknet) {
                    getStarknet = (window as any).starknet;
                    const wasConnected = localStorage.getItem('wallet_connected') === 'true';
                    if (wasConnected) {
                        // Always call enable to restore session
                        try {
                            await getStarknet.enable({ starknetVersion: "v5" });
                            if (getStarknet.account && getStarknet.account.address) {
                                setAccount(getStarknet.account);
                                setAddress(getStarknet.account.address);
                                setIsConnected(true);
                            }
                        } catch (err) {
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
                setIsInitialized(true);
                setIsLoading(false);
            }
        };

        // Set a timeout to ensure loading doesn't get stuck
        const timeout = setTimeout(() => {
            console.warn('Wallet initialization timeout - forcing loading to false');
            setIsInitialized(true);
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

    const tryConnect = async () => {
        if (!getStarknet || !isInitialized) return;

        try {
            // Check if wallet is already connected
            if (getStarknet.isConnected) {
                const account = getStarknet.account;
                if (account && account.address) {
                    console.log('Auto-connecting to:', account.address);
                    setAccount(account);
                    setAddress(account.address);
                    setIsConnected(true);
                    localStorage.setItem('wallet_connected', 'true');
                }
            }
        } catch (error) {
            console.error('Auto-connect failed:', error);
            localStorage.removeItem('wallet_connected');
        }
    };

    const connectWallet = async () => {
        if (!getStarknet || !provider) {
            alert("Please install ArgentX or Braavos wallet extension first!");
            return;
        }

        setIsLoading(true);
        try {
            // Request connection to the wallet
            const result = await getStarknet.enable({ starknetVersion: "v5" });

            if (result && result.length > 0) {
                const account = getStarknet.account;

                // Ensure the account is properly configured with the provider
                if (account && account.address) {
                    console.log('Wallet connected:', {
                        address: account.address,
                        chainId: await account.getChainId?.() || 'unknown'
                    });

                    setAccount(account);
                    setAddress(account.address);
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