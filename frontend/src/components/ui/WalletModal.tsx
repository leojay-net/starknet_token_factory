'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useConnect, useAccount } from '@starknet-react/core'
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
    const { connectors, connect, isPending, error } = useConnect()
    const { isConnected } = useAccount()
    const [selectedConnector, setSelectedConnector] = useState<string | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle')
    const [mounted, setMounted] = useState(false)

    // Ensure we're mounted on the client side
    useEffect(() => {
        setMounted(true)
    }, [])

    // Close modal when successfully connected
    useEffect(() => {
        if (isConnected) {
            setConnectionStatus('success')
            setTimeout(() => {
                onClose()
                setConnectionStatus('idle')
                setSelectedConnector(null)
            }, 1500)
        }
    }, [isConnected, onClose])

    // Handle connection errors
    useEffect(() => {
        if (error) {
            setConnectionStatus('error')
            setSelectedConnector(null)
        }
    }, [error])

    const handleConnect = async (connector: any) => {
        try {
            setSelectedConnector(connector.id)
            setConnectionStatus('connecting')
            await connect({ connector })
        } catch (err) {
            setConnectionStatus('error')
            setSelectedConnector(null)
        }
    }

    const handleRetry = () => {
        setConnectionStatus('idle')
        setSelectedConnector(null)
    }

    const handleClose = () => {
        onClose()
        setConnectionStatus('idle')
        setSelectedConnector(null)
    }

    if (!isOpen || !mounted) return null

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
                                    {error?.message || 'Please try again'}
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
                                {connectors.map((connector) => {
                                    const isConnecting = connectionStatus === 'connecting' && selectedConnector === connector.id
                                    const isAvailable = connector.available()
                                    const info = walletInfo[connector.id as keyof typeof walletInfo]

                                    return (
                                        <button
                                            key={connector.id}
                                            onClick={() => handleConnect(connector)}
                                            disabled={!isAvailable || isPending}
                                            className={`
                        w-full p-4 rounded-xl border transition-all duration-200 group
                        ${isAvailable
                                                    ? 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer hover:scale-[1.02]'
                                                    : 'border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed'
                                                }
                        ${isConnecting ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                      `}
                                        >
                                            <div className="flex items-center space-x-4">
                                                {/* Wallet Icon */}
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-110">
                                                    <span>{info?.icon || '💼'}</span>
                                                </div>

                                                <div className="flex-1 text-left">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                                        {info?.name || connector.name}
                                                    </h3>
                                                    {!isAvailable && (
                                                        <p className="text-sm text-red-500">Not installed</p>
                                                    )}
                                                </div>

                                                {isConnecting && (
                                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
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
    )

    return createPortal(modalContent, document.body)
}
