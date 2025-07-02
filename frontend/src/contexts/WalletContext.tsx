'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { constants, RpcProvider, AccountInterface } from 'starknet';

// Avoid SSR issues
type SessionAccountInterface = any;
type StarknetWindowObject = any;
type ConnectedStarknetWindowObject = any;

// Import browser-only modules
let getStarknet: any = null;

const TOKEN_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS || "0x02197940985f5fafcf93e618571b8b961a2290eb8621c24c4c5b066c4efc2b43";

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
                // Check if starknet is available in the browser window
                if (typeof window !== 'undefined' && (window as any).starknet) {
                    getStarknet = (window as any).starknet;
                    console.log('Starknet wallet detected:', getStarknet);
                    // Try to auto-connect if already connected
                    await tryConnect();
                } else {
                    console.log('No Starknet wallet detected. User needs to install ArgentX or Braavos.');
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
        }, 10000); // 10 second timeout

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
                }
            }
        } catch (error) {
            console.error('Auto-connect failed:', error);
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