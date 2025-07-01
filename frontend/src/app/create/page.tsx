'use client'

import React, { useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import { Coins, Image as ImageIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Link from 'next/link'

type TokenType = 'erc20' | 'erc721'

interface FormData {
    tokenType: TokenType
    name: string
    symbol: string
    decimals: string
    initialSupply: string
    baseUri: string
}

interface FormErrors {
    name?: string
    symbol?: string
    decimals?: string
    initialSupply?: string
    baseUri?: string
}

const CreateTokenPage: React.FC = () => {
    const { address, isConnected, isLoading: walletLoading } = useWallet()
    const [formData, setFormData] = useState<FormData>({
        tokenType: 'erc20',
        name: '',
        symbol: '',
        decimals: '18',
        initialSupply: '',
        baseUri: ''
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [isCreating, setIsCreating] = useState(false)
    const [createSuccess, setCreateSuccess] = useState(false)
    const [txHash, setTxHash] = useState('')

    const tokenTypeOptions = [
        { value: 'erc20', label: 'ERC20 Token' },
        { value: 'erc721', label: 'ERC721 NFT Collection' }
    ]

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Token name is required'
        } else if (formData.name.length < 2) {
            newErrors.name = 'Token name must be at least 2 characters'
        }

        if (!formData.symbol.trim()) {
            newErrors.symbol = 'Token symbol is required'
        } else if (formData.symbol.length < 2 || formData.symbol.length > 10) {
            newErrors.symbol = 'Symbol must be between 2-10 characters'
        } else if (!/^[A-Z0-9]+$/.test(formData.symbol)) {
            newErrors.symbol = 'Symbol must contain only uppercase letters and numbers'
        }

        if (formData.tokenType === 'erc20') {
            if (!formData.decimals) {
                newErrors.decimals = 'Decimals is required'
            } else {
                const decimals = parseInt(formData.decimals)
                if (isNaN(decimals) || decimals < 0 || decimals > 18) {
                    newErrors.decimals = 'Decimals must be between 0-18'
                }
            }

            if (!formData.initialSupply.trim()) {
                newErrors.initialSupply = 'Initial supply is required'
            } else {
                const supply = parseFloat(formData.initialSupply)
                if (isNaN(supply) || supply <= 0) {
                    newErrors.initialSupply = 'Initial supply must be greater than 0'
                }
            }
        }

        if (formData.tokenType === 'erc721') {
            if (!formData.baseUri.trim()) {
                newErrors.baseUri = 'Base URI is required for NFT collections'
            } else if (!isValidUrl(formData.baseUri)) {
                newErrors.baseUri = 'Please enter a valid URL'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const isValidUrl = (string: string): boolean => {
        try {
            new URL(string)
            return true
        } catch (_) {
            return false
        }
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsCreating(true)

        try {
            // Mock token creation - replace with actual smart contract call
            console.log('Creating token with data:', formData)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Mock transaction hash
            setTxHash('0x1234567890abcdef1234567890abcdef12345678')
            setCreateSuccess(true)

        } catch (error) {
            console.error('Error creating token:', error)
            // Handle error
        } finally {
            setIsCreating(false)
        }
    }

    if (walletLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
                    <div className="relative mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-[#4E3F95] mx-auto"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Connecting Wallet</h3>
                    <p className="text-slate-600">Please wait while we connect to your Starknet wallet</p>
                </div>
            </div>
        )
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-[#4E3F95]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Coins className="w-10 h-10 text-[#4E3F95]" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Connect Your Wallet</h1>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Please connect your Starknet wallet to create and deploy tokens on the network.
                    </p>
                    <div className="text-sm text-slate-500">
                        <p>Supported wallets: ArgentX, Braavos</p>
                    </div>
                </div>
            </div>
        )
    }

    if (createSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Token Created Successfully!</h1>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        Your {formData.tokenType.toUpperCase()} token "{formData.name}" has been successfully deployed to Starknet.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-lg mb-8 border border-slate-200">
                        <p className="text-sm font-medium text-slate-700 mb-2">Transaction Hash:</p>
                        <p className="font-mono text-sm text-slate-600 break-all bg-white p-2 rounded border">{txHash}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/dashboard" className="flex-1">
                            <Button variant="outline" className="w-full shadow-sm hover:shadow-md transition-shadow">
                                View Dashboard
                            </Button>
                        </Link>
                        <Button
                            onClick={() => {
                                setCreateSuccess(false)
                                setFormData({
                                    tokenType: 'erc20',
                                    name: '',
                                    symbol: '',
                                    decimals: '18',
                                    initialSupply: '',
                                    baseUri: ''
                                })
                                setTxHash('')
                            }}
                            className="flex-1 shadow-sm hover:shadow-md transition-shadow"
                        >
                            Create Another Token
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4E3F95]/10 rounded-xl mb-6 shadow-sm">
                        <Coins className="w-8 h-8 text-[#4E3F95]" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Create New Token</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Deploy your ERC20 or ERC721 token to Starknet without writing any code. 
                        Configure your token parameters and deploy in minutes.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                    <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-200/60">
                        <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                            <div className="w-2 h-2 bg-[#4E3F95] rounded-full mr-3"></div>
                            Token Configuration
                        </h2>
                        <p className="text-slate-600 mt-1">Fill in the details for your new token</p>
                    </div>
                    
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Token Type */}
                            <div className="space-y-3">
                                <Select
                                    label="Token Type"
                                    value={formData.tokenType}
                                    onChange={(e) => handleInputChange('tokenType', e.target.value as TokenType)}
                                    options={tokenTypeOptions}
                                    helperText="Choose between fungible tokens (ERC20) or NFT collections (ERC721)"
                                />
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Token Name */}
                                <div className="md:col-span-2">
                                    <Input
                                        label="Token Name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="e.g., My Awesome Token"
                                        error={errors.name}
                                        helperText="The full name of your token"
                                        required
                                    />
                                </div>

                                {/* Token Symbol */}
                                <Input
                                    label="Token Symbol"
                                    value={formData.symbol}
                                    onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                                    placeholder="e.g., MAT"
                                    error={errors.symbol}
                                    helperText="Short identifier (2-10 characters)"
                                    required
                                />

                                {/* ERC20 Specific Fields */}
                                {formData.tokenType === 'erc20' && (
                                    <>
                                        <Input
                                            label="Decimals"
                                            type="number"
                                            value={formData.decimals}
                                            onChange={(e) => handleInputChange('decimals', e.target.value)}
                                            placeholder="18"
                                            min="0"
                                            max="18"
                                            error={errors.decimals}
                                            helperText="Usually 18 for most tokens"
                                            required
                                        />

                                        <div className="md:col-span-2">
                                            <Input
                                                label="Initial Supply"
                                                type="number"
                                                value={formData.initialSupply}
                                                onChange={(e) => handleInputChange('initialSupply', e.target.value)}
                                                placeholder="e.g., 1000000"
                                                min="0"
                                                step="any"
                                                error={errors.initialSupply}
                                                helperText="The initial number of tokens to mint"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {/* ERC721 Specific Fields */}
                                {formData.tokenType === 'erc721' && (
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Base URI"
                                            value={formData.baseUri}
                                            onChange={(e) => handleInputChange('baseUri', e.target.value)}
                                            placeholder="https://api.example.com/metadata/"
                                            error={errors.baseUri}
                                            helperText="Base URL for token metadata (must end with /)"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Token Preview */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                                    {formData.tokenType === 'erc20' ? (
                                        <Coins className="w-5 h-5 mr-2 text-[#4E3F95]" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 mr-2 text-[#4E3F95]" />
                                    )}
                                    Token Preview
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between py-2 border-b border-slate-200">
                                        <span className="text-slate-600 font-medium">Type:</span>
                                        <span className="font-semibold text-slate-900">{formData.tokenType.toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-200">
                                        <span className="text-slate-600 font-medium">Name:</span>
                                        <span className="font-semibold text-slate-900">{formData.name || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-200">
                                        <span className="text-slate-600 font-medium">Symbol:</span>
                                        <span className="font-semibold text-slate-900">{formData.symbol || 'Not set'}</span>
                                    </div>
                                    {formData.tokenType === 'erc20' && (
                                        <>
                                            <div className="flex justify-between py-2 border-b border-slate-200">
                                                <span className="text-slate-600 font-medium">Decimals:</span>
                                                <span className="font-semibold text-slate-900">{formData.decimals}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-slate-200 col-span-2">
                                                <span className="text-slate-600 font-medium">Initial Supply:</span>
                                                <span className="font-semibold text-slate-900">{formData.initialSupply || 'Not set'}</span>
                                            </div>
                                        </>
                                    )}
                                    {formData.tokenType === 'erc721' && (
                                        <div className="flex justify-between py-2 border-b border-slate-200 col-span-2">
                                            <span className="text-slate-600 font-medium">Base URI:</span>
                                            <span className="font-semibold text-slate-900 text-xs break-all">{formData.baseUri || 'Not set'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Important Notice */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-amber-800 mb-2">Important Notice</p>
                                        <p className="text-amber-700 leading-relaxed">
                                            Once deployed, token parameters cannot be changed. Please review your configuration carefully before creating the token.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={isCreating}
                                    className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            <span>Creating Token...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Coins className="w-5 h-5" />
                                            <span>Create Token</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateTokenPage
