'use client'

import React from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Coins, Image, TrendingUp, ArrowUpRight, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useUserTokens } from '@/hooks/useUserTokens'

export default function DashboardPage() {
    const { account, address } = useWallet()
    const { userTokens, userStats, loading, error, refresh } = useUserTokens()

    const formatAddress = (addr: string | null | undefined | number | bigint) => {
        if (!addr) return '';
        const addrStr = String(addr);
        if (!addrStr || addrStr.length < 10) return addrStr;
        return `${addrStr.slice(0, 6)}...${addrStr.slice(-4)}`;
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    if (!account) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-24 h-24 bg-[var(--stark-orange)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--stark-orange)]/20">
                        <Coins className="h-12 w-12 text-[var(--stark-orange)]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
                        Connect Your Wallet
                    </h1>
                    <p className="text-[var(--stark-gray)] mb-8">
                        Connect your Starknet wallet to view your dashboard
                    </p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-24 h-24 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <div className="text-4xl text-red-500">!</div>
                    </div>
                    <h1 className="text-3xl font-bold text-red-500 mb-4">
                        Error Loading Dashboard
                    </h1>
                    <p className="text-[var(--stark-gray)] mb-8">
                        {error}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-4xl font-bold text-[var(--foreground)]">
                            Your Dashboard
                        </h1>
                        <button
                            onClick={refresh}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-[var(--stark-orange)]/30 text-[var(--stark-orange)] font-medium rounded-lg hover:bg-[var(--stark-orange)] hover:text-white transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                    <div className="flex items-center space-x-4 text-[var(--stark-gray)]">
                        <span>Wallet: {formatAddress(address || '')}</span>
                        <button
                            onClick={() => copyToClipboard(address || '')}
                            className="hover:text-[var(--stark-orange)] transition-colors p-1 rounded-lg hover:bg-[var(--stark-orange)]/10"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <StatsCard
                        icon={<Coins className="w-6 h-6" />}
                        title="Total Tokens"
                        value={userStats?.total_tokens_created || 0}
                        subtitle="Created by you"
                    />
                    <StatsCard
                        icon={<Coins className="w-6 h-6" />}
                        title="ERC20 Tokens"
                        value={userStats?.erc20_tokens || 0}
                        subtitle="Fungible tokens"
                    />
                    <StatsCard
                        icon={<Image className="w-6 h-6" />}
                        title="ERC721 Tokens"
                        value={userStats?.erc721_tokens || 0}
                        subtitle="NFT collections"
                    />
                    <StatsCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        title="Total Transactions"
                        value={userStats?.total_transactions || 0}
                        subtitle="Across all tokens"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-in-up">
                    <Link
                        href="/create"
                        className="inline-flex items-center px-6 py-3 bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)] text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105 hover-glow-orange"
                    >
                        <Coins className="w-5 h-5 mr-2" />
                        Create New Token
                    </Link>
                    <Link
                        href="/explorer"
                        className="inline-flex items-center px-6 py-3 border border-[var(--stark-purple)]/30 text-[var(--stark-purple)] font-semibold rounded-lg hover:bg-[var(--stark-purple)] hover:text-white transition-all duration-300 transform hover:scale-105"
                    >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Explore All Tokens
                    </Link>
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 border border-[var(--stark-gray)]/30 text-[var(--stark-gray)] font-semibold rounded-lg hover:bg-[var(--stark-gray)]/10 hover:text-[var(--foreground)] transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
                    >
                        <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                </div>

                {/* Tokens List */}
                <div className="card-web3 overflow-hidden animate-scale-in">
                    <div className="p-6 border-b border-[var(--border)]">
                        <h2 className="text-2xl font-bold text-[var(--foreground)]">
                            Your Tokens
                        </h2>
                        <p className="text-[var(--stark-gray)] mt-1">
                            Manage and monitor your created tokens
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="relative w-8 h-8 mx-auto mb-4">
                                <div className="absolute inset-0 border-4 border-[var(--stark-orange)]/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-[var(--stark-orange)] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-[var(--stark-gray)]">Loading your tokens...</p>
                        </div>
                    ) : userTokens.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-[var(--stark-orange)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--stark-orange)]/20">
                                <Coins className="w-8 h-8 text-[var(--stark-orange)]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                                No tokens created yet
                            </h3>
                            <p className="text-[var(--stark-gray)] mb-6">
                                Start by creating your first token
                            </p>
                            <Link
                                href="/create"
                                className="inline-flex items-center px-6 py-3 bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)] text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105 hover-glow-orange"
                            >
                                Create Token
                                <ArrowUpRight className="w-4 h-4 ml-2" />
                            </Link>
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
                                    {userTokens.map((token) => (
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
                                                                <Image className="w-5 h-5 text-white" />
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
                                                        onClick={() => copyToClipboard(token.token_address)}
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
        </div>
    )
}

function StatsCard({
    icon,
    title,
    value,
    subtitle
}: {
    icon: React.ReactNode
    title: string
    value: number
    subtitle: string
}) {
    return (
        <div className="card-web3 p-6 text-center group hover-glow-orange transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center w-12 h-12 bg-[var(--stark-orange)]/10 rounded-xl mx-auto mb-4 border border-[var(--stark-orange)]/20 group-hover:bg-[var(--stark-orange)] group-hover:border-[var(--stark-orange)] transition-all duration-300">
                <div className="text-[var(--stark-orange)] group-hover:text-white transition-colors duration-300">
                    {icon}
                </div>
            </div>
            <h3 className="text-sm font-medium text-[var(--stark-gray)] uppercase tracking-wider mb-2">
                {title}
            </h3>
            <p className="text-2xl font-bold text-[var(--foreground)] mb-1">
                {value.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--stark-gray)]">
                {subtitle}
            </p>
        </div>
    )
}
