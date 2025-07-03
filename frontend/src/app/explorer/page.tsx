'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
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
    BarChart3,
    Info,
    Copy
} from 'lucide-react'
import Link from 'next/link'
import { useAllTokens } from '@/hooks/useAllTokens'
import { useWallet } from '@/contexts/WalletContext'

export default function ExplorerPage() {
    const { tokens: allTokens, loading, error } = useAllTokens()
    const { isConnected, connect } = useWallet()
    const [filteredTokens, setFilteredTokens] = useState(allTokens)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'erc20' | 'erc721'>('all')

    // Calculate stats from allTokens
    const totalTokens = allTokens.length
    const totalERC20 = allTokens.filter(token => token.token_type === 0).length
    const totalERC721 = allTokens.filter(token => token.token_type === 1).length
    // Placeholder values for transactions and users
    const totalTransactions = 0
    const activeUsers = 0

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

    const formatAddress = (addr: string | number | bigint) => {
        const addrStr = String(addr);
        if (!addrStr || addrStr.length < 10) return addrStr;
        return `${addrStr.slice(0, 6)}...${addrStr.slice(-6)}`;
    }

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
                                    {formatNumber(totalTokens)}
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
                                    {formatNumber(totalERC20)}
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
                                    {formatNumber(totalERC721)}
                                </p>
                            </div>
                            <Palette className="h-6 w-6 text-purple-600" />
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

            {/* Information Card */}
            {!isConnected && (
                <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    Connect Your Wallet to See More Tokens
                                </h3>
                                <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                                    Currently showing limited data. Connect your wallet to see tokens you've created and get accurate statistics.
                                </p>
                                <Button onClick={connect} size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    Connect Wallet
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tokens List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        All Tokens
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                        Browse all tokens created on the platform
                    </p>
                </div>
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-300">Loading tokens...</p>
                    </div>
                ) : filteredTokens.length === 0 ? (
                    <div className="p-12 text-center">
                        <Coins className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            No tokens found
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Token
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredTokens.map((token) => (
                                    <tr key={token.token_address} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                        {token.token_type === 0 ? (
                                                            <Coins className="w-5 h-5 text-white" />
                                                        ) : (
                                                            <Palette className="w-5 h-5 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {token.name}
                                                    </div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                                        {token.symbol}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${token.token_type === 0
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                }`}>
                                                {token.token_type === 0 ? 'ERC20' : 'ERC721'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                                            <div className="flex items-center space-x-2">
                                                <span>{formatAddress(token.token_address)}</span>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(token.token_address)}
                                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(Number(token.created_at) * 1000).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                href={`/token/${token.token_address}`}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
