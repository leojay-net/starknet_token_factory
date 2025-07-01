'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Copy, ExternalLink, TrendingUp, Users, Activity, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { formatAddress, formatNumber, formatTokenAmount } from '@/lib/utils'
import { ERC20TokenDetails, ERC721TokenDetails, Transaction } from '@/types'
import { format } from 'date-fns'

const TokenDetailsPage: React.FC = () => {
    const params = useParams()
    const tokenAddress = params.address as string

    const [tokenDetails, setTokenDetails] = useState<ERC20TokenDetails | ERC721TokenDetails | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (tokenAddress) {
            // Mock data - replace with actual API calls
            setTimeout(() => {
                // Mock ERC20 token details
                setTokenDetails({
                    token_address: tokenAddress,
                    token_type: 0,
                    name: 'Starknet Token',
                    symbol: 'STRK',
                    decimals: 18,
                    total_supply: '10000000000000000000000000',
                    creator: '0xabcd1234567890abcd1234567890abcd12345678',
                    created_at: Date.now() - 86400000
                } as ERC20TokenDetails)

                // Mock transactions
                setTransactions([
                    {
                        hash: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef12345678',
                        from: '0xabcd1234567890abcd1234567890abcd12345678',
                        to: '0x1234567890abcd1234567890abcd123456789012',
                        value: '1000000000000000000000',
                        timestamp: Date.now() - 3600000,
                        token_address: tokenAddress,
                        token_symbol: 'STRK',
                        type: 'transfer'
                    },
                    {
                        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                        from: '0x0000000000000000000000000000000000000000',
                        to: '0xabcd1234567890abcd1234567890abcd12345678',
                        value: '5000000000000000000000',
                        timestamp: Date.now() - 7200000,
                        token_address: tokenAddress,
                        token_symbol: 'STRK',
                        type: 'mint'
                    }
                ])
                setLoading(false)
            }, 1000)
        }
    }, [tokenAddress])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E3F95]"></div>
            </div>
        )
    }

    if (!tokenDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Token Not Found</h1>
                    <p className="text-gray-600 mb-8">
                        The token address you're looking for doesn't exist or wasn't created through Token Factory.
                    </p>
                    <Link href="/explorer">
                        <Button>Back to Explorer</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const isERC20 = tokenDetails.token_type === 0
    const erc20Details = isERC20 ? tokenDetails as ERC20TokenDetails : null
    const erc721Details = !isERC20 ? tokenDetails as ERC721TokenDetails : null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/explorer">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{tokenDetails.name}</h1>
                    <div className="flex items-center space-x-4 mt-2">
                        <span className="text-lg text-gray-600">{tokenDetails.symbol}</span>
                        <span className="px-3 py-1 bg-[#4E3F95]/10 text-[#4E3F95] rounded-full text-sm font-medium">
                            {isERC20 ? 'ERC20' : 'ERC721'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Token Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#4E3F95]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {erc20Details ?
                                formatTokenAmount(erc20Details.total_supply, erc20Details.decimals) :
                                formatNumber(erc721Details?.total_supply || '0')
                            }
                        </div>
                        <p className="text-xs text-gray-600">
                            {isERC20 ? 'Tokens' : 'NFTs'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Holders</CardTitle>
                        <Users className="h-4 w-4 text-[#4E3F95]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-gray-600">Unique addresses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <Activity className="h-4 w-4 text-[#4E3F95]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">89,234</div>
                        <p className="text-xs text-gray-600">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Created</CardTitle>
                        <Calendar className="h-4 w-4 text-[#4E3F95]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {format(new Date(tokenDetails.created_at), 'MMM dd')}
                        </div>
                        <p className="text-xs text-gray-600">
                            {format(new Date(tokenDetails.created_at), 'yyyy')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Token Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Token Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Contract Address</span>
                            <div className="flex items-center space-x-2">
                                <span className="font-mono text-sm">{formatAddress(tokenDetails.token_address)}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(tokenDetails.token_address)}
                                    className="p-1"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`https://starkscan.co/contract/${tokenDetails.token_address}`, '_blank')}
                                    className="p-1"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Token Type</span>
                            <span className="font-medium">{isERC20 ? 'ERC20' : 'ERC721'}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Token Name</span>
                            <span className="font-medium">{tokenDetails.name}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Symbol</span>
                            <span className="font-medium">{tokenDetails.symbol}</span>
                        </div>

                        {erc20Details && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Decimals</span>
                                <span className="font-medium">{erc20Details.decimals}</span>
                            </div>
                        )}

                        {erc721Details && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Base URI</span>
                                <span className="font-mono text-sm">{formatAddress(erc721Details.base_uri)}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Creator</span>
                            <div className="flex items-center space-x-2">
                                <span className="font-mono text-sm">{formatAddress(tokenDetails.creator)}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(tokenDetails.creator)}
                                    className="p-1"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Created Date</span>
                            <span className="font-medium">
                                {format(new Date(tokenDetails.created_at), 'PPP')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Market Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Market Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">24h Volume</span>
                            <span className="font-medium">1,234,567 {tokenDetails.symbol}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Market Cap</span>
                            <span className="font-medium">$12,345,678</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Price</span>
                            <span className="font-medium">$1.23</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">24h Change</span>
                            <span className="font-medium text-green-600">+5.67%</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">All Time High</span>
                            <span className="font-medium">$2.45</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">All Time Low</span>
                            <span className="font-medium">$0.12</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length > 0 ? (
                        <div className="space-y-4">
                            {transactions.map((tx, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-3 h-3 rounded-full ${tx.type === 'mint' ? 'bg-green-500' :
                                                tx.type === 'burn' ? 'bg-red-500' : 'bg-blue-500'
                                            }`}></div>
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium capitalize">{tx.type}</span>
                                                <span className="text-sm text-gray-600">
                                                    {formatTokenAmount(tx.value, erc20Details?.decimals || 18)} {tx.token_symbol}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                From: {formatAddress(tx.from)} → To: {formatAddress(tx.to)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">
                                            {format(new Date(tx.timestamp), 'PPp')}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(`https://starkscan.co/tx/${tx.hash}`, '_blank')}
                                            className="text-xs"
                                        >
                                            View on Explorer
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No transactions found</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {copied && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
                    Copied to clipboard!
                </div>
            )}
        </div>
    )
}

export default TokenDetailsPage
