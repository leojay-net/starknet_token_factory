'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useWallet } from '@/contexts/WalletContext'
import {
    X,
    Wallet,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Loader2
} from 'lucide-react'

interface WalletModalProps {
    isOpen: boolean
    onClose: () => void
}

const walletInfo = {
    argent: {
        name: 'Argent X',
        icon: '🔶'
    },
    braavos: {
        name: 'Braavos',
        icon: '🛡️'
    },
    'wallet-connect': {
        name: 'WalletConnect',
        icon: '🔗'
    }
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
    const { connect, isConnected, isLoading } = useWallet();
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isConnected) {
            setConnectionStatus('success');
            setTimeout(() => {
                onClose();
                setConnectionStatus('idle');
                setError(null);
            }, 1500);
        }
    }, [isConnected, onClose]);

    const handleConnect = async () => {
        setConnectionStatus('connecting');
        setError(null);
        try {
            await connect();
        } catch (err: any) {
            setConnectionStatus('error');
            setError(err?.message || 'Failed to connect wallet. Please try again.');
        }
    };

    const handleRetry = () => {
        setConnectionStatus('idle');
        setError(null);
    };

    const handleClose = () => {
        onClose();
        setConnectionStatus('idle');
        setError(null);
    };

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
                <div
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full mx-auto border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Wallet className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Connect Wallet
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Choose your Starknet wallet
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="p-6 max-h-96 overflow-y-auto">
                        {connectionStatus === 'success' ? (
                            // Success State
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Connected Successfully! 🎉
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Your wallet is now connected
                                </p>
                            </div>
                        ) : connectionStatus === 'error' ? (
                            // Error State
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Connection Failed
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                                    {error || 'Please try again'}
                                </p>
                                <button
                                    onClick={handleRetry}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Try Again</span>
                                </button>
                            </div>
                        ) : (
                            // Wallet Selection
                            <div className="space-y-3">
                                <button
                                    onClick={handleConnect}
                                    disabled={isLoading || connectionStatus === 'connecting'}
                                    className={`w-full p-4 rounded-xl border transition-all duration-200 group border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer hover:scale-[1.02] ${isLoading || connectionStatus === 'connecting' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center space-x-4">
                                        {/* Wallet Icon */}
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-110">
                                            <span role="img" aria-label="Argent X">🦙</span>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Argent X / Braavos
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Connect with your browser wallet
                                            </p>
                                        </div>
                                        {(isLoading || connectionStatus === 'connecting') && (
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                        )}
                                    </div>
                                </button>
                            </div>
                        )}
                        {/* Simple footer */}
                        {connectionStatus === 'idle' && (
                            <div className="mt-6 text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Your keys stay secure in your wallet
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    return mounted ? createPortal(modalContent, document.body) : null;
}
