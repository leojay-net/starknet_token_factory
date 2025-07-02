'use client'

import React from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Coins, Image, TrendingUp, Users, ArrowUpRight, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useUserTokens } from '@/hooks/useUserTokens'

export default function DashboardPage() {
    const { account, address, isConnected } = useWallet()
    const { userTokens, userStats, loading, error } = useUserTokens()

    const formatAddress = (addr: string | null | undefined) => {
        if (!addr || typeof addr !== 'string') return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    if (!account) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-md mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        Connect Your Wallet
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">
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
                    <h1 className="text-3xl font-bold text-red-600 mb-4">
                        Error Loading Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">
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
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Your Dashboard
                    </h1>
                    <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-300">
                        <span>Wallet: {formatAddress(address || '')}</span>
                        <button
                            onClick={() => copyToClipboard(address || '')}
                            className="hover:text-slate-900 dark:hover:text-white"
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
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                    <Link
                        href="/create"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                        <Coins className="w-5 h-5 mr-2" />
                        Create New Token
                    </Link>
                    <Link
                        href="/explorer"
                        className="inline-flex items-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                    >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Explore All Tokens
                    </Link>
                </div>

                {/* Tokens List */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Your Tokens
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">
                            Manage and monitor your created tokens
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-slate-600 dark:text-slate-300">Loading your tokens...</p>
                        </div>
                    ) : userTokens.length === 0 ? (
                        <div className="p-12 text-center">
                            <Coins className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                No tokens created yet
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                Start by creating your first token
                            </p>
                            <Link
                                href="/create"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                            >
                                Create Token
                                <ArrowUpRight className="w-4 h-4 ml-2" />
                            </Link>
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
                                    {userTokens.map((token) => (
                                        <tr key={token.token_address} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                            {token.token_type === 0 ? (
                                                                <Coins className="w-5 h-5 text-white" />
                                                            ) : (
                                                                <Image className="w-5 h-5 text-white" />
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
                                                        onClick={() => copyToClipboard(token.token_address)}
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
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
                <div className="text-blue-600 dark:text-blue-400">
                    {icon}
                </div>
                <div className="ml-4">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {title}
                    </h3>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {value.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    )
}
