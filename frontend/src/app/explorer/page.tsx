'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Search,
    Coins,
    Palette,
    TrendingUp,
    Users,
    ArrowUpRight,
    Filter,
    Calendar,
    BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { useGlobalTokens } from '@/hooks/useTokenFactory'
import { ContractDebugger } from '@/components/ContractDebugger'

export default function ExplorerPage() {
    const { allTokens, globalStats, loading, error } = useGlobalTokens()
    const [filteredTokens, setFilteredTokens] = useState(allTokens)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'erc20' | 'erc721'>('all')

    useEffect(() => {
        filterTokens()
    }, [searchQuery, activeFilter, allTokens])

    const filterTokens = () => {
        let filtered = allTokens

        // Filter by type
        if (activeFilter === 'erc20') {
            filtered = filtered.filter(token => token.token_type === 0)
        } else if (activeFilter === 'erc721') {
            filtered = filtered.filter(token => token.token_type === 1)
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(token =>
                token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                token.token_address.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredTokens(filtered)
    }

    const formatAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-6)}`

    const formatDate = (timestamp: number) =>
        new Date(timestamp * 1000).toLocaleDateString()

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Token Explorer
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    Discover and explore all tokens created on the Token Factory platform.
                </p>
            </div>

            {/* Debug Panel - Remove this in production */}
            <ContractDebugger />

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Total Tokens
                                </p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatNumber(globalStats?.total_tokens || 0)}
                                </p>
                            </div>
                            <Coins className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    ERC20 Tokens
                                </p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatNumber(globalStats?.total_erc20 || 0)}
                                </p>
                            </div>
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    NFT Collections
                                </p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatNumber(globalStats?.total_erc721 || 0)}
                                </p>
                            </div>
                            <Palette className="h-6 w-6 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Transactions
                                </p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatNumber(globalStats?.total_transactions || 0)}
                                </p>
                            </div>
                            <BarChart3 className="h-6 w-6 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Active Users
                                </p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatNumber(globalStats?.active_users || 0)}
                                </p>
                            </div>
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search tokens by name, symbol, or address..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={activeFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setActiveFilter('all')}
                                size="sm"
                            >
                                All Tokens
                            </Button>
                            <Button
                                variant={activeFilter === 'erc20' ? 'default' : 'outline'}
                                onClick={() => setActiveFilter('erc20')}
                                size="sm"
                            >
                                ERC20
                            </Button>
                            <Button
                                variant={activeFilter === 'erc721' ? 'default' : 'outline'}
                                onClick={() => setActiveFilter('erc721')}
                                size="sm"
                            >
                                ERC721
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tokens List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Tokens</CardTitle>
                    <CardDescription>
                        {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600 dark:text-slate-400">Loading tokens...</p>
                            </div>
                        </div>
                    ) : filteredTokens.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                No tokens found
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Try adjusting your search criteria or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTokens.map((token, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                            {token.token_type === 0 ? (
                                                <Coins className="h-6 w-6 text-white" />
                                            ) : (
                                                <Palette className="h-6 w-6 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                                {token.name}
                                            </h4>
                                            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                                                <span>{token.symbol}</span>
                                                <span>•</span>
                                                <span>{token.token_type === 0 ? 'ERC20' : 'ERC721'}</span>
                                                <span>•</span>
                                                <span>{formatAddress(token.token_address)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Created
                                            </p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {formatDate(token.created_at)}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/token/${token.token_address}`}
                                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        >
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
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
