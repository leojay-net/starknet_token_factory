'use client'

import { useConnect } from '@starknet-react/core'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Wallet, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface WalletModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
    const { connect, connectors, isPending, error } = useConnect()
    const [isConnecting, setIsConnecting] = useState(false)

    const handleConnect = async (connector: any) => {
        try {
            setIsConnecting(true)
            await connect({ connector })
            onOpenChange(false)
        } catch (err) {
            console.error('Failed to connect wallet:', err)
        } finally {
            setIsConnecting(false)
        }
    }

    const getWalletIcon = (connectorId: string) => {
        switch (connectorId) {
            case 'argentX':
                return '🦙' // Argent logo placeholder
            case 'braavos':
                return '🛡️' // Braavos logo placeholder
            default:
                return <Wallet className="w-6 h-6" />
        }
    }

    const getWalletName = (connectorId: string) => {
        switch (connectorId) {
            case 'argentX':
                return 'Argent X'
            case 'braavos':
                return 'Braavos'
            default:
                return connectorId
        }
    }

    const getDownloadLink = (connectorId: string) => {
        switch (connectorId) {
            case 'argentX':
                return 'https://chrome.google.com/webstore/detail/argent-x/dlcobpjiigpikoobohmabehhmhfoodbb'
            case 'braavos':
                return 'https://chrome.google.com/webstore/detail/braavos-smart-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma'
            default:
                return '#'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Connect Your Wallet</DialogTitle>
                    <DialogDescription>
                        Choose a wallet to connect to Token Factory. If you don't have a wallet installed,
                        you can download one by clicking the download link.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-6">
                    {connectors.length > 0 ? (
                        connectors.map((connector) => (
                            <div key={connector.id} className="space-y-2">
                                <Button
                                    onClick={() => handleConnect(connector)}
                                    disabled={isConnecting || isPending}
                                    className="w-full flex items-center justify-between p-4 h-auto border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                                    variant="outline"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{getWalletIcon(connector.id)}</span>
                                        <div className="text-left">
                                            <div className="font-medium">{getWalletName(connector.id)}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {connector.available() ? 'Available' : 'Not Installed'}
                                            </div>
                                        </div>
                                    </div>

                                    {connector.available() ? (
                                        <div className="text-sm text-blue-600 dark:text-blue-400">
                                            {isConnecting ? 'Connecting...' : 'Connect'}
                                        </div>
                                    ) : (
                                        <a
                                            href={getDownloadLink(connector.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span>Download</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-slate-500 dark:text-slate-400 mb-4">
                                No wallet connectors available
                            </div>
                            <div className="space-y-2">
                                <a
                                    href="https://chrome.google.com/webstore/detail/argent-x/dlcobpjiigpikoobohmabehhmhfoodbb"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Download Argent X
                                </a>
                                <a
                                    href="https://chrome.google.com/webstore/detail/braavos-smart-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Download Braavos
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error.message || 'Failed to connect wallet. Please try again.'}
                        </p>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
