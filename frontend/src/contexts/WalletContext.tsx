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

                    // Add event listeners for wallet changes
                    if (getStarknet.on) {
                        getStarknet.on('accountsChanged', (accounts: string[]) => {
                            console.log('Accounts changed:', accounts);
                            if (accounts.length === 0) {
                                // User disconnected
                                setAccount(null);
                                setAddress(null);
                                setIsConnected(false);
                                localStorage.removeItem('wallet_connected');
                            } else {
                                // Account changed, try to reconnect
                                tryConnect();
                            }
                        });

                        getStarknet.on('networkChanged', (network: string) => {
                            console.log('Network changed:', network);
                            // Optionally handle network changes
                        });
                    }

                    // Check if user was previously connected
                    const wasConnected = localStorage.getItem('wallet_connected') === 'true';
                    if (wasConnected) {
                        console.log('Attempting to restore previous connection...');
                        const restored = await tryConnect();
                        if (restored) {
                            console.log('Connection restored successfully');
                        } else {
                            console.log('Failed to restore connection');
                        }
                    }
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
            // Only timeout if we're still loading and not connected
            if (isLoading && !isConnected) {
                console.warn('Wallet initialization timeout - forcing loading to false');
                setIsInitialized(true);
                setIsLoading(false);
            }
        }, 5000); // 5 second timeout

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

    const tryConnect = async (): Promise<boolean> => {
        if (!getStarknet || !isInitialized) return false;

        try {
            // Always call enable to restore connection (showModal: false = silent)
            const result = await getStarknet.enable({ starknetVersion: "v5", showModal: false });
            if (result && getStarknet.account && getStarknet.account.address) {
                setAccount(getStarknet.account);
                setAddress(getStarknet.account.address);
                setIsConnected(true);
                localStorage.setItem('wallet_connected', 'true');
                console.log('Restored wallet connection:', getStarknet.account.address);
                return true;
            }
            // If no account, clear state
            setAccount(null);
            setAddress(null);
            setIsConnected(false);
            localStorage.removeItem('wallet_connected');
            return false;
        } catch (error) {
            console.warn('Failed to restore connection', error);
            setAccount(null);
            setAddress(null);
            setIsConnected(false);
            localStorage.removeItem('wallet_connected');
            return false;
        }
    };

    const connectWallet = async () => {
        if (!getStarknet || !provider) {
            alert("Please install ArgentX or Braavos wallet extension first!");
            return;
        }

        setIsLoading(true);
        try {
            console.log('Requesting wallet connection...');

            // Request connection to the wallet
            const result = await getStarknet.enable({
                starknetVersion: "v5",
                showModal: true // Show modal for manual connection
            });

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

            // Clear any stored connection state on error
            localStorage.removeItem('wallet_connected');
            setAccount(null);
            setAddress(null);
            setIsConnected(false);

            // Show user-friendly error message
            if (error instanceof Error) {
                if (error.message.includes('rejected') || error.message.includes('denied')) {
                    alert('Wallet connection was rejected. Please try again and approve the connection.');
                } else {
                    alert(`Failed to connect wallet: ${error.message}`);
                }
            } else {
                alert('Failed to connect wallet. Please make sure you have ArgentX or Braavos installed and try again.');
            }
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