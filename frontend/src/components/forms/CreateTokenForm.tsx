'use client'

import { useState } from 'react'
import { useAccount } from '@starknet-react/core'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WalletModal } from '@/components/ui/WalletModal'
import { useTokenFactory } from '@/hooks/useTokenFactory'
import { Coins, Palette, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { provider, extractTokenAddressFromReceipt } from '@/lib/starknet'

export function CreateTokenForm() {
    console.log('🏗️ CreateTokenForm: Component initializing...');

    const { isConnected, address } = useAccount()
    const { createERC20, createERC721 } = useTokenFactory()
    const [isLoading, setIsLoading] = useState(false)
    const [showWalletModal, setShowWalletModal] = useState(false)
    const [tokenType, setTokenType] = useState<'erc20' | 'erc721'>('erc20')
    const router = useRouter();

    console.log('🏗️ CreateTokenForm: Component state:', {
        isConnected,
        address,
        hasCreateERC20: typeof createERC20 === 'function',
        hasCreateERC721: typeof createERC721 === 'function',
        isLoading,
        tokenType
    });

    const [erc20Form, setErc20Form] = useState({
        name: '',
        symbol: '',
        decimals: 18,
        initialSupply: ''
    })

    const [erc721Form, setErc721Form] = useState({
        name: '',
        symbol: '',
        baseUri: ''
    })

    const handleERC20Submit = async (e: React.FormEvent) => {
        console.log('🚨 FORM SUBMIT TRIGGERED - ERC20');
        e.preventDefault()

        console.log('🔥 CreateTokenForm: ERC20 submit started', {
            isConnected,
            address,
            formData: erc20Form,
            hasCreateERC20Function: typeof createERC20 === 'function',
            createERC20: createERC20
        });

        if (!isConnected || !address) {
            console.log('⚠️ CreateTokenForm: Wallet not connected, showing modal');
            setShowWalletModal(true)
            return
        }

        setIsLoading(true)
        try {
            toast.loading('Creating ERC20 token...');
            const tx = await createERC20(
                erc20Form.name,
                erc20Form.symbol,
                erc20Form.decimals,
                erc20Form.initialSupply
            );
            toast.loading('Waiting for transaction confirmation...');
            await provider.waitForTransaction(tx.transaction_hash, { retryInterval: 3000 });
            const receipt = await provider.getTransactionReceipt(tx.transaction_hash);
            const tokenAddress = extractTokenAddressFromReceipt(receipt);
            if (tokenAddress) {
                toast.success('ERC20 Token Created! Redirecting...');
                router.push(`/token/${tokenAddress}`);
            } else {
                toast.error('Token created, but address not found in events.');
            }
            setErc20Form({ name: '', symbol: '', decimals: 18, initialSupply: '' });
        } catch (error: unknown) {
            toast.error((error as Error)?.message || 'Failed to create token. Please try again.');
        } finally {
            setIsLoading(false)
            toast.dismiss();
            console.log('🏁 CreateTokenForm: ERC20 submit process completed');
        }
    }

    const handleERC721Submit = async (e: React.FormEvent) => {
        console.log('🚨 FORM SUBMIT TRIGGERED - ERC721');
        e.preventDefault()

        console.log('🎨 CreateTokenForm: ERC721 submit started', {
            isConnected,
            address,
            formData: erc721Form,
            hasCreateERC721Function: typeof createERC721 === 'function',
            createERC721: createERC721
        });

        if (!isConnected || !address) {
            console.log('⚠️ CreateTokenForm: Wallet not connected, showing modal');
            setShowWalletModal(true)
            return
        }

        setIsLoading(true)
        try {
            toast.loading('Creating ERC721 token...');
            const tx = await createERC721(
                erc721Form.name,
                erc721Form.symbol,
                erc721Form.baseUri
            );
            toast.loading('Waiting for transaction confirmation...');
            await provider.waitForTransaction(tx.transaction_hash, { retryInterval: 3000 });
            const receipt = await provider.getTransactionReceipt(tx.transaction_hash);
            const tokenAddress = extractTokenAddressFromReceipt(receipt);
            if (tokenAddress) {
                toast.success('ERC721 Token Created! Redirecting...');
                router.push(`/token/${tokenAddress}`);
            } else {
                toast.error('Token created, but address not found in events.');
            }
            setErc721Form({ name: '', symbol: '', baseUri: '' });
        } catch (error: unknown) {
            toast.error((error as Error)?.message || 'Failed to create NFT collection. Please try again.');
        } finally {
            setIsLoading(false)
            toast.dismiss();
            console.log('🏁 CreateTokenForm: ERC721 submit process completed');
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Tabs defaultValue="erc20" value={tokenType} onValueChange={(value) => setTokenType(value as 'erc20' | 'erc721')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="erc20" className="flex items-center space-x-2">
                        <Coins className="h-4 w-4" />
                        <span>ERC20 Token</span>
                    </TabsTrigger>
                    <TabsTrigger value="erc721" className="flex items-center space-x-2">
                        <Palette className="h-4 w-4" />
                        <span>ERC721 NFT</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="erc20">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create ERC20 Token</CardTitle>
                            <CardDescription>
                                Deploy a fungible token with custom parameters. Perfect for creating currencies, utility tokens, or governance tokens.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleERC20Submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="erc20-name">Token Name</Label>
                                        <Input
                                            id="erc20-name"
                                            placeholder="My Awesome Token"
                                            value={erc20Form.name}
                                            onChange={(e) => setErc20Form(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="erc20-symbol">Token Symbol</Label>
                                        <Input
                                            id="erc20-symbol"
                                            placeholder="MAT"
                                            value={erc20Form.symbol}
                                            onChange={(e) => setErc20Form(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="erc20-decimals">Decimals</Label>
                                        <Input
                                            id="erc20-decimals"
                                            type="number"
                                            min="0"
                                            max="18"
                                            value={erc20Form.decimals}
                                            onChange={(e) => setErc20Form(prev => ({ ...prev, decimals: parseInt(e.target.value) || 18 }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="erc20-supply">Initial Supply</Label>
                                        <Input
                                            id="erc20-supply"
                                            placeholder="1000000"
                                            value={erc20Form.initialSupply}
                                            onChange={(e) => setErc20Form(prev => ({ ...prev, initialSupply: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading || !isConnected}
                                    onClick={() => console.log('🖱️ ERC20 Submit button clicked!')}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Token...
                                        </>
                                    ) : (
                                        'Create ERC20 Token'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="erc721">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create ERC721 NFT Collection</CardTitle>
                            <CardDescription>
                                Deploy a non-fungible token collection. Perfect for creating unique digital assets, collectibles, or certificates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleERC721Submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="erc721-name">Collection Name</Label>
                                        <Input
                                            id="erc721-name"
                                            placeholder="My NFT Collection"
                                            value={erc721Form.name}
                                            onChange={(e) => setErc721Form(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="erc721-symbol">Collection Symbol</Label>
                                        <Input
                                            id="erc721-symbol"
                                            placeholder="MNC"
                                            value={erc721Form.symbol}
                                            onChange={(e) => setErc721Form(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="erc721-baseuri">Base URI</Label>
                                    <Textarea
                                        id="erc721-baseuri"
                                        placeholder="https://api.example.com/metadata/"
                                        value={erc721Form.baseUri}
                                        onChange={(e) => setErc721Form(prev => ({ ...prev, baseUri: e.target.value }))}
                                        rows={3}
                                        required
                                    />
                                    <p className="text-sm text-slate-500">
                                        The base URI where your NFT metadata will be stored. Each token will append its ID to this URI.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading || !isConnected}
                                    onClick={() => console.log('🖱️ ERC721 Submit button clicked!')}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Collection...
                                        </>
                                    ) : (
                                        'Create ERC721 Collection'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {!isConnected && (
                <Card className="mt-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <p className="text-sm font-medium">
                                Connect your wallet to start creating tokens
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Wallet Modal */}
            <WalletModal
                isOpen={showWalletModal}
                onClose={() => setShowWalletModal(false)}
            />
        </div>
    )
}
