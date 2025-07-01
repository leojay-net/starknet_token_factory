'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { Coins, Activity, TrendingUp, Users, Plus, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { formatAddress, formatNumber } from '@/lib/utils'
import { TokenInfo, UserStats } from '@/types'

const DashboardPage: React.FC = () => {
    const { address, isConnected, isLoading: walletLoading } = useWallet()
    const [userStats, setUserStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)

    // Mock data - replace with actual API calls
    useEffect(() => {
        if (isConnected && address) {
            // Simulate API call
            setTimeout(() => {
                setUserStats({
                    tokensCreated: 5,
                    erc20Count: 3,
                    erc721Count: 2,
                    totalTransactions: 127,
                    tokens: [
                        {
                            token_address: '0x1234...5678',
                            token_type: 0,
                            name: 'My Awesome Token',
                            symbol: 'MAT',
                            created_at: Date.now() - 86400000
                        },
                        {
                            token_address: '0xabcd...efgh',
                            token_type: 1,
                            name: 'Cool NFT Collection',
                            symbol: 'CNC',
                            created_at: Date.now() - 172800000
                        }
                    ]
                })
                setLoading(false)
            }, 1000)
        } else {
            setLoading(false)
        }
    }, [address, isConnected])

    if (walletLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E3F95] mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        {walletLoading ? 'Connecting wallet...' : 'Loading dashboard...'}
                    </p>
                </div>
            </div>
        )
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-[#4E3F95]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Coins className="w-8 h-8 text-[#4E3F95]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
                    <p className="text-gray-600 mb-8">
                        Please connect your Starknet wallet to view your dashboard and manage your tokens.
                    </p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E3F95]"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back! Manage your tokens and track their performance.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Connected: {formatAddress(address || '')}
                    </p>
                </div>
                <Link href="/create">
                    <Button className="flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Create New Token</span>
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                        <Coins className="h-4 w-4 text-[#4E3F95]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userStats?.tokensCreated || 0}</div>
                        <p className="text-xs text-gray-600">
                            {userStats?.erc20Count || 0} ERC20, {userStats?.erc721Count || 0} ERC721
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <Activity className="h-4 w-4 text-[#4E3F95]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(userStats?.totalTransactions || 0)}</div>
                        <p className="text-xs text-gray-600">Across all tokens</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Performance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">+12.5%</div>
                        <p className="text-xs text-gray-600">This month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Holders</CardTitle>
                        <Users className="h-4 w-4 text-[#4E3F95]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-gray-600">Unique addresses</p>
                    </CardContent>
                </Card>
            </div>

            {/* Your Tokens */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Your Tokens</CardTitle>
                        <Link href="/create">
                            <Button variant="outline" size="sm" className="flex items-center space-x-2">
                                <Plus className="w-4 h-4" />
                                <span>Create Token</span>
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {userStats?.tokens && userStats.tokens.length > 0 ? (
                        <div className="space-y-4">
                            {userStats.tokens.map((token, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-[#4E3F95]/10 rounded-lg flex items-center justify-center">
                                            <span className="text-[#4E3F95] font-semibold text-sm">
                                                {token.symbol.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{token.name}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span>{token.symbol}</span>
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                                    {token.token_type === 0 ? 'ERC20' : 'ERC721'}
                                                </span>
                                                <span>{formatAddress(token.token_address)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Link href={`/tokens/${token.token_address}`}>
                                            <Button variant="outline" size="sm" className="flex items-center space-x-1">
                                                <span>View</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-[#4E3F95]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Coins className="w-8 h-8 text-[#4E3F95]" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tokens yet</h3>
                            <p className="text-gray-600 mb-6">
                                Get started by creating your first token. It only takes a few minutes!
                            </p>
                            <Link href="/create">
                                <Button className="flex items-center space-x-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Create Your First Token</span>
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Mock activity data */}
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium text-gray-900">Token Created</p>
                                    <p className="text-sm text-gray-600">My Awesome Token (MAT) was successfully deployed</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">2 hours ago</span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium text-gray-900">Transaction Processed</p>
                                    <p className="text-sm text-gray-600">1,000 MAT tokens transferred</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">5 hours ago</span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium text-gray-900">NFT Minted</p>
                                    <p className="text-sm text-gray-600">Cool NFT Collection #1 minted</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">1 day ago</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default DashboardPage
