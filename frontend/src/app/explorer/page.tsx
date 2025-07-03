'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
    Search,
    Coins,
    Palette,
    TrendingUp,
    BarChart3,
    Info,
    Copy
} from 'lucide-react'
import Link from 'next/link'
import { useAllTokens } from '@/hooks/useAllTokens'
import { useWallet } from '@/contexts/WalletContext'

export default function ExplorerPage() {
    const { tokens: allTokens, loading } = useAllTokens()
    const { isConnected, connect } = useWallet()
    const [filteredTokens, setFilteredTokens] = useState(allTokens)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'erc20' | 'erc721'>('all')

    // Calculate stats from allTokens
    const totalTokens = allTokens.length
    const totalERC20 = allTokens.filter(token => token.token_type === 0).length
    const totalERC721 = allTokens.filter(token => token.token_type === 1).length
    // Placeholder values for transactions
    const totalTransactions = 0

    const filterTokens = useCallback(() => {
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
    }, [allTokens, activeFilter, searchQuery])

    useEffect(() => {
        filterTokens()
    }, [filterTokens])

    const formatAddress = (addr: string | number | bigint) => {
        const addrStr = String(addr);
        if (!addrStr || addrStr.length < 10) return addrStr;
        return `${addrStr.slice(0, 6)}...${addrStr.slice(-6)}`;
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 animate-fade-in">
                <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">
                    Token Explorer
                </h1>
                <p className="text-lg text-[var(--stark-gray)]">
                    Discover and explore all tokens created on the Token Factory platform.
                </p>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8 animate-slide-in-up">
                <Card className="card-web3 hover-glow-orange">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--stark-gray)]">
                                    Total Tokens
                                </p>
                                <p className="text-2xl font-bold text-[var(--foreground)]">
                                    {formatNumber(totalTokens)}
                                </p>
                            </div>
                            <Coins className="h-6 w-6 text-[var(--stark-orange)]" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-web3 hover-glow-orange">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--stark-gray)]">
                                    ERC20 Tokens
                                </p>
                                <p className="text-2xl font-bold text-[var(--foreground)]">
                                    {formatNumber(totalERC20)}
                                </p>
                            </div>
                            <TrendingUp className="h-6 w-6 text-[var(--stark-orange)]" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-web3 hover-glow-purple">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--stark-gray)]">
                                    NFT Collections
                                </p>
                                <p className="text-2xl font-bold text-[var(--foreground)]">
                                    {formatNumber(totalERC721)}
                                </p>
                            </div>
                            <Palette className="h-6 w-6 text-[var(--stark-purple)]" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-web3">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--stark-gray)]">
                                    Transactions
                                </p>
                                <p className="text-2xl font-bold text-[var(--foreground)]">
                                    {formatNumber(totalTransactions)}
                                </p>
                            </div>
                            <BarChart3 className="h-6 w-6 text-[var(--stark-orange)]" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8 card-web3 animate-scale-in">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--stark-gray)]" />
                                <Input
                                    placeholder="Search tokens by name, symbol, or address..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 border-[var(--stark-orange)]/20 focus:border-[var(--stark-orange)] bg-[var(--card)] text-[var(--foreground)]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={activeFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setActiveFilter('all')}
                                size="sm"
                                className={activeFilter === 'all' ? 'bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)]' : 'border-[var(--stark-orange)]/30 text-[var(--stark-orange)] hover:bg-[var(--stark-orange)] hover:text-white'}
                            >
                                All Tokens
                            </Button>
                            <Button
                                variant={activeFilter === 'erc20' ? 'default' : 'outline'}
                                onClick={() => setActiveFilter('erc20')}
                                size="sm"
                                className={activeFilter === 'erc20' ? 'bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)]' : 'border-[var(--stark-orange)]/30 text-[var(--stark-orange)] hover:bg-[var(--stark-orange)] hover:text-white'}
                            >
                                ERC20
                            </Button>
                            <Button
                                variant={activeFilter === 'erc721' ? 'default' : 'outline'}
                                onClick={() => setActiveFilter('erc721')}
                                size="sm"
                                className={activeFilter === 'erc721' ? 'bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)]' : 'border-[var(--stark-orange)]/30 text-[var(--stark-orange)] hover:bg-[var(--stark-orange)] hover:text-white'}
                            >
                                ERC721
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Information Card */}
            {!isConnected && (
                <Card className="mb-8 border-[var(--stark-orange)]/20 bg-[var(--stark-orange)]/5 card-web3">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <Info className="h-5 w-5 text-[var(--stark-orange)] mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-[var(--foreground)] mb-2">
                                    Connect Your Wallet to See More Tokens
                                </h3>
                                <p className="text-[var(--stark-gray)] text-sm mb-4">
                                    Currently showing limited data. Connect your wallet to see tokens you&apos;ve created and get accurate statistics.
                                </p>
                                <Button onClick={connect} size="sm" className="bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)] text-white">
                                    Connect Wallet
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tokens List */}
            <div className="card-web3 overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-[var(--border)]">
                    <h2 className="text-2xl font-bold text-[var(--foreground)]">
                        All Tokens
                    </h2>
                    <p className="text-[var(--stark-gray)] mt-1">
                        Browse all tokens created on the platform
                    </p>
                </div>
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="relative w-8 h-8 mx-auto mb-4">
                            <div className="absolute inset-0 border-4 border-[var(--stark-orange)]/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-[var(--stark-orange)] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[var(--stark-gray)]">Loading tokens...</p>
                    </div>
                ) : filteredTokens.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-[var(--stark-orange)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--stark-orange)]/20">
                            <Coins className="w-8 h-8 text-[var(--stark-orange)]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                            No tokens found
                        </h3>
                        <p className="text-[var(--stark-gray)] mb-6">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--muted)]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--stark-gray)] uppercase tracking-wider">
                                        Token
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--stark-gray)] uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--stark-gray)] uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--stark-gray)] uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--stark-gray)] uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                                {filteredTokens.map((token) => (
                                    <tr key={token.token_address} className="hover:bg-[var(--muted)] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${token.token_type === 0
                                                        ? 'bg-[var(--stark-orange)]'
                                                        : 'bg-[var(--stark-purple)]'
                                                        }`}>
                                                        {token.token_type === 0 ? (
                                                            <Coins className="w-5 h-5 text-white" />
                                                        ) : (
                                                            <Palette className="w-5 h-5 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-[var(--foreground)]">
                                                        {token.name}
                                                    </div>
                                                    <div className="text-sm text-[var(--stark-gray)]">
                                                        {token.symbol}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${token.token_type === 0
                                                ? 'bg-[var(--stark-orange)]/10 text-[var(--stark-orange)] border border-[var(--stark-orange)]/20'
                                                : 'bg-[var(--stark-purple)]/10 text-[var(--stark-purple)] border border-[var(--stark-purple)]/20'
                                                }`}>
                                                {token.token_type === 0 ? 'ERC20' : 'ERC721'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                                            <div className="flex items-center space-x-2">
                                                <span>{formatAddress(token.token_address)}</span>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(token.token_address)}
                                                    className="text-[var(--stark-gray)] hover:text-[var(--stark-orange)] transition-colors p-1 rounded-lg hover:bg-[var(--stark-orange)]/10"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--stark-gray)]">
                                            {new Date(Number(token.created_at) * 1000).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                href={`/token/${token.token_address}`}
                                                className="text-[var(--stark-orange)] hover:text-[var(--stark-orange-dark)] transition-colors font-medium"
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
