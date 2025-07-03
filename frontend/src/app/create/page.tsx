'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/contexts/WalletContext'
import { Coins, Image as ImageIcon, ArrowRight, Loader2 } from 'lucide-react'
import { CreateTokenFormData } from '@/types'
import { getTokenFactoryContract, bigIntToU256, encodeByteArrayForCallData, extractTokenAddressFromReceipt, provider } from '@/lib/starknet'
import { useToast } from '@/components/ui/toaster'
import { CallData } from 'starknet'

export default function CreatePage() {
    const { account, address, isConnected } = useWallet()
    const { addToast } = useToast()
    const router = useRouter()
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
            let result

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
                result = await contract.invoke('create_erc20', calldata)
                console.log('ERC20 token created:', result)
            } else {
                // Create ERC721 token contract (no minting yet)
                const calldata = CallData.compile({
                    name: encodeByteArrayForCallData(formData.name),
                    symbol: encodeByteArrayForCallData(formData.symbol)
                })
                result = await contract.invoke('create_erc721', calldata)
                console.log('ERC721 contract created:', result)
            }

            // Wait for transaction confirmation and get receipt
            const receipt = await provider.waitForTransaction(result.transaction_hash)
            console.log('Transaction receipt:', receipt)

            // Extract token address from receipt
            let tokenAddress = extractTokenAddressFromReceipt(receipt)
            console.log('Extracted token address:', tokenAddress)

            // If we couldn't extract from receipt, try to get the latest token for this user
            if (!tokenAddress && address) {
                try {
                    console.log('Attempting to fetch latest token for user...');
                    const contract = getTokenFactoryContract();
                    const userTokens = await contract.call('get_created_tokens', [address]);
                    console.log('User tokens after creation:', userTokens);

                    if (Array.isArray(userTokens) && userTokens.length > 0) {
                        // Get the last (most recent) token
                        const latestToken = userTokens[userTokens.length - 1];
                        tokenAddress = latestToken.token_address;
                        console.log('Found latest token address:', tokenAddress);
                    }
                } catch (fallbackError) {
                    console.warn('Fallback token address extraction failed:', fallbackError);
                }
            }

            addToast({
                title: 'Success!',
                description: `${formData.type.toUpperCase()} token "${formData.name}" (${formData.symbol}) has been created successfully!`,
            })

            // Redirect to token page if we have the address, otherwise to dashboard
            if (tokenAddress) {
                // Ensure token address is in hex format for the URL
                let hexTokenAddress = String(tokenAddress);
                if (!hexTokenAddress.startsWith('0x')) {
                    hexTokenAddress = '0x' + BigInt(tokenAddress).toString(16);
                }
                console.log('Redirecting to token page with address:', hexTokenAddress);

                setTimeout(() => {
                    router.push(`/token/${hexTokenAddress}`)
                }, 1500) // Small delay to show the success toast
            } else {
                setTimeout(() => {
                    router.push('/dashboard')
                }, 1500)
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
                    <div className="w-24 h-24 bg-[var(--stark-orange)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--stark-orange)]/20">
                        <Coins className="h-12 w-12 text-[var(--stark-orange)]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
                        Connect Your Wallet
                    </h1>
                    <p className="text-[var(--stark-gray)] mb-8">
                        You need to connect your Starknet wallet to create tokens
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4 text-responsive-xl">
                        Create Your Token
                    </h1>
                    <p className="text-xl text-[var(--stark-gray)]">
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
                            icon={<ImageIcon className="h-12 w-12" />}
                            title="ERC721 Contract (NFT)"
                            description="Create an NFT contract that can mint unique tokens with individual metadata"
                            features={[
                                "Deploy NFT contract",
                                "Mint with custom metadata",
                                "Individual token URIs",
                                "Owner-controlled minting"
                            ]}
                            onClick={() => {
                                setSelectedType('erc721')
                                setFormData(prev => ({ ...prev, type: 'erc721' }))
                            }}
                        />
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto card-web3 p-8 animate-scale-in">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">
                                {selectedType === 'erc20' ? 'Create ERC20 Token' : 'Create ERC721 Contract'}
                            </h2>
                            <button
                                onClick={() => setSelectedType(null)}
                                className="text-[var(--stark-gray)] hover:text-[var(--stark-orange)] transition-colors"
                            >
                                Change Type
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--stark-gray)] mb-2">
                                    Token Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., My Awesome Token"
                                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--stark-gray)] focus:ring-2 focus:ring-[var(--stark-orange)] focus:border-[var(--stark-orange)]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--stark-gray)] mb-2">
                                    Token Symbol
                                </label>
                                <input
                                    type="text"
                                    value={formData.symbol}
                                    onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                                    placeholder="e.g., MAT"
                                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--stark-gray)] focus:ring-2 focus:ring-[var(--stark-orange)] focus:border-[var(--stark-orange)]"
                                    required
                                />
                            </div>

                            {selectedType === 'erc20' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--stark-gray)] mb-2">
                                            Decimals
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="18"
                                            value={formData.decimals}
                                            onChange={(e) => setFormData(prev => ({ ...prev, decimals: parseInt(e.target.value) }))}
                                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--stark-orange)] focus:border-[var(--stark-orange)]"
                                            required
                                        />
                                        <p className="text-sm text-[var(--stark-gray)] mt-1">
                                            18 decimals is standard for most tokens
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--stark-gray)] mb-2">
                                            Initial Supply
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.initial_supply}
                                            onChange={(e) => setFormData(prev => ({ ...prev, initial_supply: e.target.value }))}
                                            placeholder="e.g., 1000000"
                                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--stark-gray)] focus:ring-2 focus:ring-[var(--stark-orange)] focus:border-[var(--stark-orange)]"
                                            required
                                        />
                                        <p className="text-sm text-[var(--stark-gray)] mt-1">
                                            Total number of tokens to create initially
                                        </p>
                                    </div>
                                </>
                            )}

                            {selectedType === 'erc721' && (
                                <div className="bg-[var(--stark-orange)]/5 rounded-lg p-4 border border-[var(--stark-orange)]/20">
                                    <h4 className="font-medium text-[var(--foreground)] mb-2">
                                        Creating ERC721 Contract
                                    </h4>
                                    <p className="text-sm text-[var(--stark-gray)] mb-3">
                                        You&apos;re creating an ERC721 contract that can mint NFTs. After creation, you can mint individual NFTs with their own metadata and images.
                                    </p>
                                    <div className="text-xs text-[var(--stark-gray)]">
                                        • Each NFT will have its own metadata URI<br />
                                        • Only the contract owner can mint new NFTs<br />
                                        • Minting happens after contract deployment
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)] text-white font-semibold py-4 px-6 rounded-lg hover-glow-orange transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating {selectedType === 'erc20' ? 'Token' : 'Contract'}...
                                    </>
                                ) : (
                                    <>
                                        Create {selectedType === 'erc20' ? 'Token' : 'Contract'}
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
            className="card-web3 p-8 cursor-pointer group transform transition-all duration-300 hover:scale-105 animate-scale-in"
        >
            <div className="text-[var(--stark-orange)] mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                {title}
            </h3>
            <p className="text-[var(--stark-gray)] mb-6">
                {description}
            </p>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-[var(--stark-gray)]">
                        <div className="w-2 h-2 bg-[var(--stark-orange)] rounded-full mr-3"></div>
                        {feature}
                    </li>
                ))}
            </ul>
            <div className="mt-6 text-[var(--stark-orange)] font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
                Choose This Type
                <ArrowRight className="w-4 h-4 ml-2" />
            </div>
        </div>
    )
}
