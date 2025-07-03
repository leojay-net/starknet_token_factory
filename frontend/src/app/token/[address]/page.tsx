'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
    ArrowLeft,
    Copy,
    ExternalLink,
    Activity,
    Coins,
    Palette,
    Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { ERC20TokenData, ERC721TokenData, TokenTransaction } from '@/types'
import { useTokenData } from '@/hooks/useTokenData'

export default function TokenPage() {
    const params = useParams()
    const tokenAddress = params.address as string
    const { tokenData, loading, error } = useTokenData(tokenAddress)
    const [transactions, setTransactions] = useState<TokenTransaction[]>([])

    useEffect(() => {
        if (tokenAddress) {
            fetchTransactionHistory()
        }
    }, [tokenAddress])

    const fetchTransactionHistory = async () => {
        try {
            // TODO: Implement real transaction history fetching
            // For now, we'll show empty transactions since we don't have event indexing
            await new Promise(resolve => setTimeout(resolve, 500))
            setTransactions([])
        } catch (error) {
            console.error('Failed to fetch transaction history:', error)
        }
    }

    const formatAddress = (addr: string | number | bigint) => {
        const addrStr = String(addr);
        if (!addrStr || addrStr.length < 10) return addrStr;
        return `${addrStr.slice(0, 6)}...${addrStr.slice(-6)}`;
    }

    const formatAmount = (amount: string, decimals: number = 18) => {
        const value = parseFloat(amount) / Math.pow(10, decimals)
        if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
        if (value >= 1000) return `${(value / 1000).toFixed(2)}K`
        return value.toFixed(2)
    }

    const formatDate = (timestamp: number) =>
        new Date(timestamp * 1000).toLocaleString()

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        // TODO: Add toast notification
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-400">Loading token data...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Error Loading Token
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        {error}
                    </p>
                    <div className="space-x-4">
                        <Link href="/dashboard">
                            <Button variant="outline">Go to Dashboard</Button>
                        </Link>
                        <Link href="/explorer">
                            <Button>Browse All Tokens</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!tokenData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                        Token Not Found
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        The token address you&apos;re looking for doesn&apos;t exist or hasn&apos;t been created through our factory.
                    </p>
                    <Link href="/explorer">
                        <Button>Back to Explorer</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const isERC20 = tokenData.type === 'ERC20'
    const erc721Data = tokenData as ERC721TokenData

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <Link href="/explorer">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Explorer
                    </Button>
                </Link>
            </div>

            {/* Token Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                        {isERC20 ? (
                                            <Coins className="h-8 w-8 text-white" />
                                        ) : (
                                            <Palette className="h-8 w-8 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">{tokenData.name}</CardTitle>
                                        <CardDescription className="text-lg">
                                            {tokenData.symbol} • {isERC20 ? 'ERC20 Token' : 'ERC721 NFT Collection'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Contract Address
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <code className="text-sm font-mono text-slate-900 dark:text-white">
                                            {formatAddress(tokenData.address)}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(tokenData.address)}
                                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <a
                                            href={`https://sepolia.starkscan.co/contract/${tokenData.address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Token Type
                                    </span>
                                    <span className="text-sm text-slate-900 dark:text-white">
                                        {isERC20 ? 'ERC20 (Fungible)' : 'ERC721 (NFT)'}
                                    </span>
                                </div>

                                {isERC20 && tokenData.type === 'ERC20' && (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Decimals
                                        </span>
                                        <span className="text-sm text-slate-900 dark:text-white">
                                            {(tokenData as ERC20TokenData).decimals}
                                        </span>
                                    </div>
                                )}

                                {!isERC20 && tokenData.type === 'ERC721' && (
                                    <>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                Base URI
                                            </span>
                                            <code className="text-sm font-mono text-slate-900 dark:text-white">
                                                {erc721Data.baseUri || 'Not available'}
                                            </code>
                                        </div>
                                        {erc721Data.tokenUri && (
                                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    Token URI (ID 1)
                                                </span>
                                                <code className="text-sm font-mono text-slate-900 dark:text-white">
                                                    {erc721Data.tokenUri}
                                                </code>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* NFT Preview Section */}
                    {!isERC20 && erc721Data.metadata && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <ImageIcon className="h-5 w-5" />
                                    <span>NFT Preview</span>
                                </CardTitle>
                                <CardDescription>
                                    Metadata for the first NFT in this collection
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* NFT Image */}
                                    {erc721Data.metadata.image && (
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-slate-900 dark:text-white">Image</h4>
                                            <div className="relative">
                                                <img
                                                    src={erc721Data.metadata.image}
                                                    alt={erc721Data.metadata.name || 'NFT Preview'}
                                                    className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-600 max-h-96 object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* NFT Metadata */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-slate-900 dark:text-white">Metadata</h4>
                                        <div className="space-y-2">
                                            {erc721Data.metadata.name && (
                                                <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Name:</span>
                                                    <span className="text-sm text-slate-900 dark:text-white">{erc721Data.metadata.name}</span>
                                                </div>
                                            )}
                                            {erc721Data.metadata.description && (
                                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">Description:</span>
                                                    <span className="text-sm text-slate-900 dark:text-white">{erc721Data.metadata.description}</span>
                                                </div>
                                            )}
                                            {erc721Data.metadata.external_url && (
                                                <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">External URL:</span>
                                                    <a
                                                        href={erc721Data.metadata.external_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        <ExternalLink className="h-3 w-3 inline mr-1" />
                                                        View
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Attributes */}
                                        {erc721Data.metadata.attributes && erc721Data.metadata.attributes.length > 0 && (
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-slate-900 dark:text-white">Attributes</h5>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {erc721Data.metadata.attributes.map((attr, index) => (
                                                        <div key={index} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-center">
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">{attr.trait_type}</div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{attr.value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Stats */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                    Total Supply
                                </h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {(() => {
                                        if (tokenData.type === 'ERC20') {
                                            const erc20Data = tokenData as ERC20TokenData;
                                            return formatAmount(erc20Data.totalSupply.toString(), erc20Data.decimals);
                                        }
                                        return 'N/A';
                                    })()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                    Total Transactions
                                </h3>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {transactions.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                        Latest {isERC20 ? 'transfers' : 'NFT transfers'} for this token
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-8">
                            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">No transactions found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((tx, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                                                {formatAddress(tx.hash)}
                                            </code>
                                            <a
                                                href={`https://sepolia.starkscan.co/tx/${tx.hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            From {formatAddress(tx.from)} to {formatAddress(tx.to)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                                            {tx.amount && tokenData.type === 'ERC20'
                                                ? `${formatAmount(tx.amount, (tokenData as ERC20TokenData).decimals)} ${tokenData.symbol}`
                                                : `Token #${tx.token_id}`
                                            }
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatDate(tx.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
