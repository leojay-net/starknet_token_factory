'use client'

import React, { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Coins, Image, ArrowRight, Loader2 } from 'lucide-react'
import { CreateTokenFormData } from '@/types'
import { getTokenFactoryContract, bigIntToU256, encodeByteArrayForCallData } from '@/lib/starknet'
import { useToast } from '@/components/ui/toaster'
import { CallData } from 'starknet'

export default function CreatePage() {
    const { account, address, isConnected } = useWallet()
    const { addToast } = useToast()
    const [selectedType, setSelectedType] = useState<'erc20' | 'erc721' | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [formData, setFormData] = useState<CreateTokenFormData>({
        type: 'erc20',
        name: '',
        symbol: '',
        decimals: 18,
        initial_supply: '',
        base_uri: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!account || !address) {
            addToast({
                title: 'Error',
                description: 'Please connect your wallet first.',
                variant: 'destructive',
            })
            return
        }

        setIsCreating(true)
        try {
            const contract = getTokenFactoryContract(account)

            if (formData.type === 'erc20') {
                // Create ERC20 token
                if (!formData.initial_supply || !formData.decimals) {
                    throw new Error('Initial supply and decimals are required for ERC20 tokens')
                }
                const initialSupplyU256 = bigIntToU256(BigInt(formData.initial_supply) * BigInt(10 ** formData.decimals))
                const calldata = CallData.compile({
                    name: encodeByteArrayForCallData(formData.name),
                    symbol: encodeByteArrayForCallData(formData.symbol),
                    decimals: formData.decimals,
                    initial_supply: initialSupplyU256
                })
                const result = await contract.invoke('create_erc20', calldata)
                console.log('ERC20 token created:', result)
                addToast({
                    title: 'Success!',
                    description: `ERC20 token "${formData.name}" (${formData.symbol}) has been created successfully!`,
                })
            } else {
                // Create ERC721 token
                if (!formData.base_uri) {
                    throw new Error('Base URI is required for ERC721 tokens')
                }
                const calldata = CallData.compile({
                    name: encodeByteArrayForCallData(formData.name),
                    symbol: encodeByteArrayForCallData(formData.symbol),
                    base_uri: encodeByteArrayForCallData(formData.base_uri)
                })
                const result = await contract.invoke('create_erc721', calldata)
                console.log('ERC721 token created:', result)
                addToast({
                    title: 'Success!',
                    description: `ERC721 collection "${formData.name}" (${formData.symbol}) has been created successfully!`,
                })
            }
        } catch (error) {
            console.error('Error creating token:', error)
            addToast({
                title: 'Error',
                description: 'Failed to create token. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsCreating(false)
        }
    }

    if (!isConnected || !account) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-md mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        Connect Your Wallet
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">
                        You need to connect your Starknet wallet to create tokens
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Create Your Token
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300">
                        Deploy ERC20 or ERC721 tokens with just a few clicks
                    </p>
                </div>

                {!selectedType ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        <TokenTypeCard
                            icon={<Coins className="h-12 w-12" />}
                            title="ERC20 Token"
                            description="Create fungible tokens like cryptocurrencies, governance tokens, or utility tokens"
                            features={[
                                "Customizable decimals",
                                "Initial supply",
                                "Mint & burn functions",
                                "Transfer functionality"
                            ]}
                            onClick={() => {
                                setSelectedType('erc20')
                                setFormData(prev => ({ ...prev, type: 'erc20' }))
                            }}
                        />
                        <TokenTypeCard
                            icon={<Image className="h-12 w-12" />}
                            title="ERC721 Token (NFT)"
                            description="Create unique non-fungible tokens for art, collectibles, or digital assets"
                            features={[
                                "Unique token IDs",
                                "Metadata support",
                                "Transfer & approval",
                                "Creator tracking"
                            ]}
                            onClick={() => {
                                setSelectedType('erc721')
                                setFormData(prev => ({ ...prev, type: 'erc721' }))
                            }}
                        />
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {selectedType === 'erc20' ? 'ERC20 Token' : 'ERC721 Token'}
                            </h2>
                            <button
                                onClick={() => setSelectedType(null)}
                                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                                Change Type
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Token Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., My Awesome Token"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Token Symbol
                                </label>
                                <input
                                    type="text"
                                    value={formData.symbol}
                                    onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                                    placeholder="e.g., MAT"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {selectedType === 'erc20' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Decimals
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="18"
                                            value={formData.decimals}
                                            onChange={(e) => setFormData(prev => ({ ...prev, decimals: parseInt(e.target.value) }))}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            18 decimals is standard for most tokens
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Initial Supply
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.initial_supply}
                                            onChange={(e) => setFormData(prev => ({ ...prev, initial_supply: e.target.value }))}
                                            placeholder="e.g., 1000000"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Total number of tokens to create initially
                                        </p>
                                    </div>
                                </>
                            )}

                            {selectedType === 'erc721' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Base URI
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.base_uri}
                                        onChange={(e) => setFormData(prev => ({ ...prev, base_uri: e.target.value }))}
                                        placeholder="https://api.example.com/metadata/"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Base URL for token metadata (JSON files)
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating Token...
                                    </>
                                ) : (
                                    <>
                                        Create Token
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

function TokenTypeCard({
    icon,
    title,
    description,
    features,
    onClick
}: {
    icon: React.ReactNode
    title: string
    description: string
    features: string[]
    onClick: () => void
}) {
    return (
        <div
            onClick={onClick}
            className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 cursor-pointer group"
        >
            <div className="text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {title}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
                {description}
            </p>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        {feature}
                    </li>
                ))}
            </ul>
            <div className="mt-6 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
                Choose This Type
                <ArrowRight className="w-4 h-4 ml-2" />
            </div>
        </div>
    )
}
