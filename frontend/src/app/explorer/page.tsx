'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, ExternalLink, Coins, Image as ImageIcon, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { formatAddress, formatNumber } from '@/lib/utils'
import { TokenInfo } from '@/types'

interface ExplorerStats {
    totalTokens: number
    totalERC20: number
    totalERC721: number
    totalTransactions: number
    totalCreators: number
}

interface TokenWithStats extends TokenInfo {
    totalSupply?: string
    holders?: number
    transactions?: number
    volume24h?: string
    creator?: string
}

const ExplorerPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [stats, setStats] = useState<ExplorerStats | null>(null)
    const [tokens, setTokens] = useState<TokenWithStats[]>([])
    const [loading, setLoading] = useState(true)

    const filterOptions = [
        { value: 'all', label: 'All Tokens' },
        { value: 'erc20', label: 'ERC20 Tokens' },
        { value: 'erc721', label: 'ERC721 Collections' }
    ]

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'transactions', label: 'Most Transactions' },
        { value: 'holders', label: 'Most Holders' },
        { value: 'volume', label: 'Highest Volume' }
    ]

    // Mock data - replace with actual API calls
    useEffect(() => {
        setTimeout(() => {
            setStats({
                totalTokens: 12567,
                totalERC20: 8934,
                totalERC721: 3633,
                totalTransactions: 1_234_567,
                totalCreators: 4521
            })

            setTokens([
                {
                    token_address: '0x1234567890abcdef1234567890abcdef12345678',
                    token_type: 0,
                    name: 'Starknet Token',
                    symbol: 'STRK',
                    created_at: Date.now() - 86400000,
                    totalSupply: '10000000000000000000000000',
                    holders: 12543,
                    transactions: 89234,
                    volume24h: '1234567',
                    creator: '0xabcd...1234'
                },
                {
                    token_address: '0xabcdef1234567890abcdef1234567890abcdef12',
                    token_type: 1,
                    name: 'Starknet Punks',
                    symbol: 'SPUNK',
                    created_at: Date.now() - 172800000,
                    totalSupply: '10000',
                    holders: 3421,
                    transactions: 15678,
                    volume24h: '567890',
                    creator: '0x1234...abcd'
                },
                {
                    token_address: '0x567890abcdef1234567890abcdef1234567890ab',
                    token_type: 0,
                    name: 'Cairo Coin',
                    symbol: 'CAIRO',
                    created_at: Date.now() - 259200000,
                    totalSupply: '1000000000000000000000000',
                    holders: 8765,
                    transactions: 45123,
                    volume24h: '345678',
                    creator: '0x5678...cdef'
                }
            ])
            setLoading(false)
        }, 1000)
    }, [])

    const filteredTokens = tokens.filter(token => {
        const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.token_address.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterType === 'all' ||
            (filterType === 'erc20' && token.token_type === 0) ||
            (filterType === 'erc721' && token.token_type === 1)

        return matchesSearch && matchesFilter
    })

    const sortedTokens = [...filteredTokens].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return b.created_at - a.created_at
            case 'oldest':
                return a.created_at - b.created_at
            case 'transactions':
                return (b.transactions || 0) - (a.transactions || 0)
            case 'holders':
                return (b.holders || 0) - (a.holders || 0)
            case 'volume':
                return parseFloat(b.volume24h || '0') - parseFloat(a.volume24h || '0')
            default:
                return 0
        }
    })

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
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Token Explorer</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Discover all tokens created through Token Factory. Track their performance,
                    view transaction history, and explore the growing ecosystem.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                    <CardContent className="text-center p-6">
                        <div className="text-2xl font-bold text-[#4E3F95] mb-2">
                            {formatNumber(stats?.totalTokens || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Tokens</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="text-center p-6">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                            {formatNumber(stats?.totalERC20 || 0)}
                        </div>
                        <div className="text-sm text-gray-600">ERC20 Tokens</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="text-center p-6">
                        <div className="text-2xl font-bold text-purple-600 mb-2">
                            {formatNumber(stats?.totalERC721 || 0)}
                        </div>
                        <div className="text-sm text-gray-600">NFT Collections</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="text-center p-6">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                            {formatNumber(stats?.totalTransactions || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Transactions</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="text-center p-6">
                        <div className="text-2xl font-bold text-orange-600 mb-2">
                            {formatNumber(stats?.totalCreators || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Creators</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by name, symbol, or address..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E3F95] focus:border-[#4E3F95]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                options={filterOptions}
                                className="min-w-[140px]"
                            />

                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                options={sortOptions}
                                className="min-w-[140px]"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Token List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Tokens ({sortedTokens.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {sortedTokens.length > 0 ? (
                        <div className="space-y-4">
                            {sortedTokens.map((token, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-[#4E3F95]/10 rounded-lg flex items-center justify-center">
                                            {token.token_type === 0 ? (
                                                <Coins className="w-6 h-6 text-[#4E3F95]" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-[#4E3F95]" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{token.name}</h3>
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                                    {token.token_type === 0 ? 'ERC20' : 'ERC721'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span className="font-medium">{token.symbol}</span>
                                                <span>{formatAddress(token.token_address)}</span>
                                                <span>Creator: {formatAddress(token.creator || '')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center space-x-8 text-sm">
                                        <div className="text-center">
                                            <div className="font-semibold text-gray-900">
                                                {formatNumber(token.holders || 0)}
                                            </div>
                                            <div className="text-gray-600">Holders</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-semibold text-gray-900">
                                                {formatNumber(token.transactions || 0)}
                                            </div>
                                            <div className="text-gray-600">Transactions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-semibold text-gray-900">
                                                {formatNumber(parseFloat(token.volume24h || '0'))}
                                            </div>
                                            <div className="text-gray-600">24h Volume</div>
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
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tokens found</h3>
                            <p className="text-gray-600">
                                Try adjusting your search criteria or filters.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Recent Activity</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium text-gray-900">New Token Created</p>
                                    <p className="text-sm text-gray-600">DeFi Token (DFT) deployed by {formatAddress('0x1234...5678')}</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">5 minutes ago</span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium text-gray-900">Large Transaction</p>
                                    <p className="text-sm text-gray-600">1M STRK tokens transferred</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">12 minutes ago</span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium text-gray-900">NFT Collection Launch</p>
                                    <p className="text-sm text-gray-600">Starknet Warriors collection went live</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">1 hour ago</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ExplorerPage
