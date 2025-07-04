'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
    ArrowLeft,
    Copy,
    ExternalLink,
    Coins,
    Palette,
    Image as ImageIcon,
    Plus,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { ERC20TokenData } from '@/types'
import { useTokenData } from '@/hooks/useTokenData'
import { useWallet } from '@/contexts/WalletContext'
import { useToast } from '@/components/ui/toaster'
import { getERC721Contract, getERC20Contract, encodeByteArrayForCallData, provider, bigIntToU256 } from '@/lib/starknet'
import { CallData } from 'starknet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function TokenPage() {
    const params = useParams()
    const tokenAddress = params.address as string
    const { tokenData, loading, error } = useTokenData(tokenAddress)
    const { account, address, isConnected } = useWallet()
    const { addToast } = useToast()
    const [nftCollection, setNftCollection] = useState<Array<{
        tokenId: number;
        owner: string;
        tokenUri: string;
        metadata: {
            name?: string;
            description?: string;
            image?: string;
            attributes?: Array<{ trait_type: string; value: string }>;
        } | null;
    }>>([])
    const [loadingNfts, setLoadingNfts] = useState(false)

    // Minting state
    const [showMintModal, setShowMintModal] = useState(false)
    const [isMinting, setIsMinting] = useState(false)
    const [mintFormData, setMintFormData] = useState({
        name: '',
        description: '',
        recipient: address || ''
    })
    const [nftImageUrl, setNftImageUrl] = useState<string>("")
    const [uploadingImage, setUploadingImage] = useState(false)
    const [uploadingMetadata, setUploadingMetadata] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // Transfer state
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [selectedNft, setSelectedNft] = useState<{
        tokenId: number;
        owner: string;
        tokenUri: string;
        metadata: {
            name?: string;
            description?: string;
            image?: string;
            attributes?: Array<{ trait_type: string; value: string }>;
        } | null;
    } | null>(null)
    const [transferAddress, setTransferAddress] = useState('')
    const [isTransferring, setIsTransferring] = useState(false)

    // === ERC20 Mint State ===
    const [showErc20MintModal, setShowErc20MintModal] = useState(false)
    const [erc20MintRecipient, setErc20MintRecipient] = useState(address || '')
    const [erc20MintAmount, setErc20MintAmount] = useState('')
    const [isErc20Minting, setIsErc20Minting] = useState(false)

    // === ERC20 Transfer State ===
    const [showErc20TransferModal, setShowErc20TransferModal] = useState(false)
    const [erc20TransferRecipient, setErc20TransferRecipient] = useState('')
    const [erc20TransferAmount, setErc20TransferAmount] = useState('')
    const [isErc20Transferring, setIsErc20Transferring] = useState(false)

    const fetchNftCollection = useCallback(async () => {
        if (!tokenData || tokenData.type !== 'ERC721') return;

        setLoadingNfts(true);
        try {
            const contract = getERC721Contract(tokenAddress);
            const nfts = [];

            // Get the upper bound for token IDs
            const nextTokenIdResult = await contract.call('get_next_token_id');
            let maxId = 0;
            if (Array.isArray(nextTokenIdResult)) {
                // If it's an array, use the first element
                const val = nextTokenIdResult[0];
                if (val && typeof val === 'object' && 'low' in val) {
                    maxId = Number(val.low);
                } else {
                    maxId = Number(val);
                }
            } else if (nextTokenIdResult && typeof nextTokenIdResult === 'object' && 'low' in nextTokenIdResult) {
                maxId = Number(nextTokenIdResult.low);
            } else {
                maxId = Number(nextTokenIdResult);
            }

            for (let i = 1; i < maxId; i++) {
                try {
                    const ownerResult = await contract.call('owner_of', [{ low: BigInt(i), high: 0n }]);
                    if (ownerResult) {
                        // NFT exists, fetch its metadata
                        let tokenUri = '';
                        let metadata = null;
                        try {
                            const tokenUriResult = await contract.call('token_uri', [{ low: BigInt(i), high: 0n }]);
                            tokenUri = parseByteArray(tokenUriResult);

                            if (tokenUri) {
                                let fetchUrl = tokenUri;
                                if (tokenUri.startsWith('ipfs://')) {
                                    fetchUrl = tokenUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
                                }
                                const response = await fetch(fetchUrl);
                                if (response.ok) {
                                    metadata = await response.json();
                                }
                            }
                        } catch (error) {
                            console.warn(`Failed to fetch token URI for NFT ${i}:`, error);
                        }

                        nfts.push({
                            tokenId: i,
                            owner: String(ownerResult),
                            tokenUri,
                            metadata
                        });
                    }
                } catch {
                    // NFT doesn't exist (burned or never minted), just skip
                    continue;
                }
            }

            setNftCollection(nfts);
        } catch (error) {
            console.error('Error fetching NFT collection:', error);
        } finally {
            setLoadingNfts(false);
        }
    }, [tokenData, tokenAddress])

    useEffect(() => {
        if (tokenAddress && tokenData && tokenData.type === 'ERC721') {
            fetchNftCollection()
        }
    }, [tokenAddress, tokenData, fetchNftCollection])

    // Helper function to parse ByteArray
    const parseByteArray = (result: unknown): string => {
        try {
            console.log('Parsing ByteArray result:', result);

            if (typeof result === 'string') {
                return result
            }

            // Handle raw ByteArray format: [data_len, data1, data2, ..., pending_word, pending_word_len]
            if (Array.isArray(result) && result.length >= 2) {
                const dataLen = parseInt(result[0] as string);
                let fullString = '';

                // Extract data elements (skip first element which is length)
                for (let i = 1; i <= dataLen; i++) {
                    if (result[i] && result[i] !== '0x0') {
                        const hexString = (result[i] as string).replace('0x', '');
                        const decodedPart = Buffer.from(hexString, 'hex').toString('utf8').replace(/\0/g, '');
                        fullString += decodedPart;
                    }
                }

                // Handle pending word if present
                const pendingWordIndex = dataLen + 1;
                const pendingWordLenIndex = result.length - 1;

                if (result[pendingWordLenIndex] && parseInt(result[pendingWordLenIndex] as string) > 0) {
                    const pendingWordLen = parseInt(result[pendingWordLenIndex] as string);
                    if (result[pendingWordIndex] && result[pendingWordIndex] !== '0x0') {
                        const pendingHex = (result[pendingWordIndex] as string).replace('0x', '');
                        // Only take the specified number of bytes from the pending word
                        const pendingBytes = pendingHex.slice(0, pendingWordLen * 2); // 2 hex chars per byte
                        if (pendingBytes) {
                            const pendingString = Buffer.from(pendingBytes, 'hex').toString('utf8');
                            fullString += pendingString;
                        }
                    }
                }

                console.log('Parsed ByteArray result:', fullString);
                return fullString.trim();
            }

            // Handle structured ByteArray format: { data: [...], pending_word: ..., pending_word_len: ... }
            if (result && typeof result === 'object' && 'data' in result) {
                const structuredResult = result as {
                    data?: unknown[];
                    pending_word?: string;
                    pending_word_len?: string;
                };

                if (structuredResult.data && Array.isArray(structuredResult.data)) {
                    let fullString = '';

                    for (const element of structuredResult.data) {
                        if (element && element !== '0x0') {
                            const hexString = (element as string).replace('0x', '');
                            const decodedPart = Buffer.from(hexString, 'hex').toString('utf8').replace(/\0/g, '');
                            fullString += decodedPart;
                        }
                    }

                    if (structuredResult.pending_word && structuredResult.pending_word !== '0x0' &&
                        structuredResult.pending_word_len && parseInt(structuredResult.pending_word_len) > 0) {
                        const pendingHex = structuredResult.pending_word.replace('0x', '');
                        const pendingLength = parseInt(structuredResult.pending_word_len);
                        const pendingBytes = pendingHex.slice(0, pendingLength * 2);
                        if (pendingBytes) {
                            const pendingString = Buffer.from(pendingBytes, 'hex').toString('utf8');
                            fullString += pendingString;
                        }
                    }

                    return fullString.trim();
                }
            }

            return ''
        } catch (e) {
            console.warn('Error parsing ByteArray:', e, result)
            return ''
        }
    }

    const formatAddress = (addr: string | number | bigint) => {
        const addrStr = String(addr);
        if (!addrStr || addrStr.length < 10) return addrStr;
        return `${addrStr.slice(0, 6)}...${addrStr.slice(-6)}`;
    }

    const formatAmount = (amount: string, decimals: number = 18) => {
        const value = parseFloat(amount) / Math.pow(10, decimals)
        if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
        if (value >= 1000) return `${(value / 1000).toFixed(2)}K`
        return value.toFixed(2)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        addToast({
            title: 'Copied',
            description: 'Address copied to clipboard',
        })
    }

    // Minting functions
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null

        if (file) {
            await uploadNftImage(file)
        } else {
            setNftImageUrl("")
        }
    }

    const uploadNftImage = async (file: File) => {
        if (!file) return ""
        setUploadingImage(true)
        try {
            const data = new FormData()
            data.set("file", file)
            const uploadRequest = await fetch("/api/files", {
                method: "POST",
                body: data,
            })
            const response = await uploadRequest.json()

            // Ensure we get a proper IPFS URL
            let url = response
            if (typeof response === 'object' && response.url) {
                url = response.url
            }

            // Convert to proper IPFS gateway URL if needed
            if (url.includes('gateway.pinata.cloud')) {
                setNftImageUrl(url)
                return url
            } else if (url.startsWith('ipfs://')) {
                const gatewayUrl = url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                setNftImageUrl(gatewayUrl)
                return gatewayUrl
            } else {
                setNftImageUrl(url)
                return url
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            addToast({
                title: 'Upload Error',
                description: 'Failed to upload image. Please try again.',
                variant: 'destructive',
            })
            return ""
        } finally {
            setUploadingImage(false)
        }
    }

    const uploadMetadata = async (metadata: {
        name: string;
        description: string;
        image: string;
        attributes: Array<{ trait_type: string; value: string }>;
    }) => {
        try {
            const data = new FormData()
            const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
            data.set("file", metadataBlob, "metadata.json")

            const uploadRequest = await fetch("/api/files", {
                method: "POST",
                body: data,
            })
            const response = await uploadRequest.json()

            // Ensure we get a proper IPFS URL
            let url = response
            if (typeof response === 'object' && response.url) {
                url = response.url
            }

            // Return the proper IPFS URL
            if (url.includes('gateway.pinata.cloud')) {
                return url
            } else if (url.startsWith('ipfs://')) {
                return url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
            } else {
                return url
            }
        } catch (error) {
            console.error('Error uploading metadata:', error)
            addToast({
                title: 'Upload Error',
                description: 'Failed to upload metadata. Please try again.',
                variant: 'destructive',
            })
            return ""
        }
    }

    const handleMintNFT = async () => {
        if (!account || !isConnected) {
            addToast({
                title: 'Error',
                description: 'Please connect your wallet first.',
                variant: 'destructive',
            })
            return
        }

        if (!nftImageUrl) {
            addToast({
                title: 'Error',
                description: 'Please upload an image first.',
                variant: 'destructive',
            })
            return
        }

        if (!mintFormData.name || !mintFormData.description) {
            addToast({
                title: 'Error',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            })
            return
        }

        setIsMinting(true)
        try {
            // Create metadata JSON
            const metadata = {
                name: mintFormData.name,
                description: mintFormData.description,
                image: nftImageUrl,
                attributes: []
            }

            // Upload metadata to IPFS
            setUploadingMetadata(true)
            const metadataUri = await uploadMetadata(metadata)
            setUploadingMetadata(false)

            if (!metadataUri) {
                throw new Error('Failed to upload metadata to IPFS')
            }

            // Mint the NFT
            const contract = getERC721Contract(tokenAddress, account)

            console.log('=== NFT MINTING DEBUG ===');
            console.log('Original metadata URI:', metadataUri);
            console.log('Metadata URI length:', metadataUri.length);
            console.log('Metadata URI bytes:', new TextEncoder().encode(metadataUri));

            // Manually encode the ByteArray for the contract call
            const encodedTokenUri = encodeByteArrayForCallData(metadataUri);
            console.log('=== BYTEARRAY ENCODING ===');
            console.log('Encoded ByteArray structure:', encodedTokenUri);
            console.log('Data array length:', encodedTokenUri.data.length);
            console.log('Data elements:', encodedTokenUri.data);
            console.log('Pending word:', encodedTokenUri.pending_word);
            console.log('Pending word length:', encodedTokenUri.pending_word_len);

            // Log each data element decoded
            console.log('=== DATA ELEMENTS DECODED ===');
            encodedTokenUri.data.forEach((element, index) => {
                const hexString = element.replace('0x', '');
                const decoded = Buffer.from(hexString, 'hex').toString('utf8').replace(/\0/g, '');
                console.log(`Data[${index}]: ${element} -> "${decoded}"`);
            });

            // Log pending word decoded if exists
            if (encodedTokenUri.pending_word !== '0x0' && parseInt(encodedTokenUri.pending_word_len) > 0) {
                const pendingHex = encodedTokenUri.pending_word.replace('0x', '');
                const pendingBytes = pendingHex.slice(0, parseInt(encodedTokenUri.pending_word_len) * 2);
                const pendingDecoded = Buffer.from(pendingBytes, 'hex').toString('utf8');
                console.log(`Pending word: ${encodedTokenUri.pending_word} -> "${pendingDecoded}"`);
            }

            // Use CallData.compile to properly serialize the ByteArray structure
            const calldata = CallData.compile({
                to: mintFormData.recipient,
                token_uri: encodedTokenUri
            });

            console.log('=== CALLDATA ===');
            console.log('Compiled calldata:', calldata);
            console.log('Calldata length:', calldata.length);

            // Test reconstruction to verify encoding/decoding
            console.log('=== RECONSTRUCTION TEST ===');
            let reconstructed = '';

            // Reconstruct from data array
            for (const element of encodedTokenUri.data) {
                const hexString = element.replace('0x', '');
                const decodedPart = Buffer.from(hexString, 'hex').toString('utf8').replace(/\0/g, '');
                reconstructed += decodedPart;
            }

            // Add pending word if exists
            if (encodedTokenUri.pending_word !== '0x0' && parseInt(encodedTokenUri.pending_word_len) > 0) {
                const pendingHex = encodedTokenUri.pending_word.replace('0x', '');
                const pendingBytes = pendingHex.slice(0, parseInt(encodedTokenUri.pending_word_len) * 2);
                const pendingString = Buffer.from(pendingBytes, 'hex').toString('utf8');
                reconstructed += pendingString;
            }

            console.log('Original URI:', metadataUri);
            console.log('Reconstructed URI:', reconstructed);
            console.log('Match:', metadataUri === reconstructed);
            console.log('Original length:', metadataUri.length);
            console.log('Reconstructed length:', reconstructed.length);
            console.log('=== END DEBUG ===');

            const result = await contract.invoke('mint', calldata)
            console.log('NFT minted:', result)

            // Wait for transaction confirmation
            await provider.waitForTransaction(result.transaction_hash)

            addToast({
                title: 'Success!',
                description: `NFT "${mintFormData.name}" has been minted successfully!`,
            })
            setMintFormData({ name: '', description: '', recipient: address || '' })
            setNftImageUrl("")
            setShowMintModal(false)

            // Refresh NFT collection to show the new NFT
            await fetchNftCollection()

        } catch (error) {
            console.error('Error minting NFT:', error)
            addToast({
                title: 'Error',
                description: 'Failed to mint NFT. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsMinting(false)
            setUploadingMetadata(false)
        }
    }

    // Add handler to open transfer modal
    const openTransferModal = (nft: {
        tokenId: number;
        owner: string;
        tokenUri: string;
        metadata: {
            name?: string;
            description?: string;
            image?: string;
            attributes?: Array<{ trait_type: string; value: string }>;
        } | null;
    }) => {
        setSelectedNft(nft);
        setShowTransferModal(true);
        setTransferAddress('');
    };

    // Add transfer function
    const handleTransferNFT = async () => {
        if (!account || !selectedNft || !transferAddress) return;
        setIsTransferring(true);
        try {
            const contract = getERC721Contract(tokenAddress, account);
            const calldata = CallData.compile([address || '', transferAddress, { low: BigInt(selectedNft.tokenId), high: 0n }]);
            const result = await contract.invoke('transfer_from', calldata);
            await provider.waitForTransaction(result.transaction_hash);
            addToast({ title: 'Success', description: 'NFT transferred!' });
            setShowTransferModal(false);
            fetchNftCollection();
        } catch {
            addToast({ title: 'Error', description: 'Transfer failed', variant: 'destructive' });
        } finally {
            setIsTransferring(false);
        }
    };

    // === ERC20 Mint Handler ===
    const handleErc20Mint = async () => {
        if (!account || !isConnected) {
            addToast({ title: 'Error', description: 'Please connect your wallet first.', variant: 'destructive' })
            return
        }
        if (!erc20MintRecipient || !erc20MintAmount || !tokenData) {
            addToast({ title: 'Error', description: 'Recipient and amount required.', variant: 'destructive' })
            return
        }
        setIsErc20Minting(true)
        try {
            const contract = getERC20Contract(tokenAddress, account)
            const decimals = (tokenData as ERC20TokenData).decimals
            const amount = BigInt(Math.floor(Number(erc20MintAmount) * 10 ** decimals))
            const calldata = [erc20MintRecipient, bigIntToU256(amount)]
            const result = await contract.invoke('mint', calldata)
            await provider.waitForTransaction(result.transaction_hash)
            addToast({ title: 'Success!', description: `Minted ${erc20MintAmount} ${tokenData.symbol} to ${formatAddress(erc20MintRecipient)}` })
            setShowErc20MintModal(false)
            setErc20MintRecipient(address || '')
            setErc20MintAmount('')
        } catch {
            addToast({ title: 'Error', description: 'Mint failed. Are you the owner?', variant: 'destructive' })
        } finally {
            setIsErc20Minting(false)
        }
    }

    // === ERC20 Transfer Handler ===
    const handleErc20Transfer = async () => {
        if (!account || !isConnected) {
            addToast({ title: 'Error', description: 'Please connect your wallet first.', variant: 'destructive' })
            return
        }
        if (!erc20TransferRecipient || !erc20TransferAmount || !tokenData) {
            addToast({ title: 'Error', description: 'Recipient and amount required.', variant: 'destructive' })
            return
        }
        setIsErc20Transferring(true)
        try {
            const contract = getERC20Contract(tokenAddress, account)
            const decimals = (tokenData as ERC20TokenData).decimals
            const amount = BigInt(Math.floor(Number(erc20TransferAmount) * 10 ** decimals))
            const calldata = [erc20TransferRecipient, bigIntToU256(amount)]
            const result = await contract.invoke('transfer', calldata)
            await provider.waitForTransaction(result.transaction_hash)
            addToast({ title: 'Success!', description: `Transferred ${erc20TransferAmount} ${tokenData.symbol} to ${formatAddress(erc20TransferRecipient)}` })
            setShowErc20TransferModal(false)
            setErc20TransferRecipient('')
            setErc20TransferAmount('')
        } catch {
            addToast({ title: 'Error', description: 'Transfer failed.', variant: 'destructive' })
        } finally {
            setIsErc20Transferring(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-screen -mt-20">
                    <div className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 border-4 border-[var(--stark-orange)]/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-[var(--stark-orange)] border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-2 border-4 border-[var(--stark-purple)]/20 rounded-full"></div>
                            <div className="absolute inset-2 border-4 border-[var(--stark-purple)] border-t-transparent rounded-full animate-spin animate-rotate-slow"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                            Loading Token Data
                        </h2>
                        <p className="text-[var(--stark-gray)] max-w-md mx-auto">
                            Fetching token information from the blockchain. This may take a few moments...
                        </p>
                        <div className="mt-8 flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-[var(--stark-orange)] rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-[var(--stark-purple)] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-[var(--stark-blue)] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-200 dark:border-red-800">
                        <div className="text-4xl text-red-500">!</div>
                    </div>
                    <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
                        Error Loading Token
                    </h1>
                    <p className="text-[var(--stark-gray)] mb-8 max-w-md mx-auto">
                        {error}
                    </p>
                    <div className="space-x-4">
                        <Link href="/dashboard">
                            <Button variant="outline" className="border-[var(--stark-orange)]/30 text-[var(--stark-orange)] hover:bg-[var(--stark-orange)] hover:text-white">
                                Go to Dashboard
                            </Button>
                        </Link>
                        <Link href="/explorer">
                            <Button className="bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)] text-white">
                                Browse All Tokens
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!tokenData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-[var(--muted)] rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-[var(--stark-gray)]/30">
                        <div className="text-4xl text-[var(--stark-gray)]">?</div>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
                        Token Not Found
                    </h1>
                    <p className="text-[var(--stark-gray)] mb-8 max-w-md mx-auto">
                        The token address you&apos;re looking for doesn&apos;t exist or hasn&apos;t been created through our factory.
                    </p>
                    <Link href="/explorer">
                        <Button className="bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)] text-white">
                            Back to Explorer
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const isERC20 = tokenData.type === 'ERC20'

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div className="flex items-center space-x-4">
                    <Link href="/explorer">
                        <Button variant="outline" size="sm" className="border-[var(--stark-orange)]/30 text-[var(--stark-orange)] hover:bg-[var(--stark-orange)] hover:text-white transition-all duration-300">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Explorer
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Network Badge */}
                    <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        <div className="status-online w-2 h-2 rounded-full"></div>
                        <span>Starknet Sepolia</span>
                    </div>
                </div>
            </div>

            {/* Enhanced Token Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-scale-in">
                <div className="lg:col-span-2">
                    <Card className="card-web3 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-hexagon-pattern opacity-5"></div>

                        <CardHeader className="relative">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-6">
                                    <div className="relative">
                                        <div className={`w-20 h-20 ${isERC20
                                            ? 'bg-[var(--stark-orange)]'
                                            : 'bg-[var(--stark-purple)]'
                                            } rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105`}>
                                            {isERC20 ? (
                                                <Coins className="h-10 w-10 text-white" />
                                            ) : (
                                                <Palette className="h-10 w-10 text-white" />
                                            )}
                                        </div>
                                        {/* Modern particles effect */}
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--stark-orange)] rounded-full animate-pulse"></div>
                                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[var(--stark-purple)] rounded-full animate-float"></div>
                                    </div>
                                    <div>
                                        <CardTitle className="text-3xl font-bold text-[var(--foreground)]">
                                            {tokenData.name}
                                        </CardTitle>
                                        <div className="text-xl mt-2 flex items-center space-x-3">
                                            <span className="font-semibold text-[var(--stark-gray)]">{tokenData.symbol}</span>
                                            <span className="text-[var(--stark-gray)]">•</span>
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isERC20
                                                ? 'bg-[var(--stark-orange)]/10 text-[var(--stark-orange)] border border-[var(--stark-orange)]/20'
                                                : 'bg-[var(--stark-purple)]/10 text-[var(--stark-purple)] border border-[var(--stark-purple)]/20'
                                                }`}>
                                                {isERC20 ? 'ERC20 Token' : 'ERC721 Collection'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* ERC20 Mint/Transfer Buttons */}
                                {isERC20 && isConnected && (
                                    <div className="flex flex-col space-y-2">
                                        <Button
                                            onClick={() => setShowErc20MintModal(true)}
                                            className="bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)] text-white transform transition-all duration-300 hover:scale-105"
                                        >
                                            Mint
                                        </Button>
                                        <Button
                                            onClick={() => setShowErc20TransferModal(true)}
                                            className="bg-[var(--stark-purple)] hover:bg-[var(--stark-purple-dark)] text-white transform transition-all duration-300 hover:scale-105"
                                        >
                                            Transfer
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Contract Address */}
                                <div className="p-4 glass rounded-xl border border-[var(--stark-orange)]/10 hover:border-[var(--stark-orange)]/20 transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-[var(--stark-gray)] uppercase tracking-wider">
                                            Contract Address
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => copyToClipboard(tokenData.address)}
                                                className="p-1.5 text-[var(--stark-gray)] hover:text-[var(--stark-orange)] hover:bg-[var(--stark-orange)]/10 rounded-lg transition-all duration-300"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <a
                                                href={`https://sepolia.starkscan.co/contract/${tokenData.address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-[var(--stark-gray)] hover:text-[var(--stark-orange)] hover:bg-[var(--stark-orange)]/10 rounded-lg transition-all duration-300"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                    <code className="text-sm font-mono text-[var(--foreground)] block mt-2">
                                        {formatAddress(tokenData.address)}
                                    </code>
                                </div>

                                {/* Token Type */}
                                <div className="p-4 glass rounded-xl border border-[var(--stark-purple)]/10 hover:border-[var(--stark-purple)]/20 transition-all duration-300">
                                    <span className="text-sm font-semibold text-[var(--stark-gray)] uppercase tracking-wider block">
                                        Token Standard
                                    </span>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <span className="text-sm font-bold text-[var(--foreground)]">
                                            {isERC20 ? 'ERC20' : 'ERC721'}
                                        </span>
                                        <span className="text-xs text-[var(--stark-gray)]">
                                            ({isERC20 ? 'Fungible' : 'Non-Fungible'})
                                        </span>
                                    </div>
                                </div>

                                {/* Decimals for ERC20 only */}
                                {isERC20 && tokenData.type === 'ERC20' && (
                                    <div className="p-4 glass rounded-xl border border-[var(--stark-blue)]/10 hover:border-[var(--stark-blue)]/20 transition-all duration-300">
                                        <span className="text-sm font-semibold text-[var(--stark-gray)] uppercase tracking-wider block">
                                            Decimals
                                        </span>
                                        <span className="text-sm font-bold text-[var(--foreground)] block mt-2">
                                            {(tokenData as ERC20TokenData).decimals}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* NFT Collection Gallery */}
                    {!isERC20 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <ImageIcon className="h-5 w-5" />
                                    <span>NFT Collection</span>
                                </CardTitle>
                                <CardDescription>
                                    All NFTs minted from this collection
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingNfts ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                                            <p className="text-slate-600 dark:text-slate-400">Loading NFTs...</p>
                                        </div>
                                    </div>
                                ) : nftCollection.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 mx-auto mb-6 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                                            <ImageIcon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                            No NFTs Minted Yet
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                                            This collection doesn&apos;t have any NFTs yet. Be the first to mint one!
                                        </p>
                                        {isConnected && (
                                            <Button
                                                onClick={() => setShowMintModal(true)}
                                                className="bg-[var(--stark-orange)] hover:bg-yellow-400"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Mint First NFT
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {nftCollection.map((nft) => (
                                            <div
                                                key={nft.tokenId}
                                                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
                                            >
                                                {/* NFT Image */}
                                                <div className="aspect-square bg-white dark:bg-slate-800 relative overflow-hidden">
                                                    {nft.metadata?.image ? (
                                                        <Image
                                                            src={nft.metadata.image.includes('gateway.pinata.cloud') ?
                                                                nft.metadata.image :
                                                                nft.metadata.image.startsWith('ipfs://') ?
                                                                    nft.metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') :
                                                                    nft.metadata.image
                                                            }
                                                            alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={() => {
                                                                // Handle error by hiding the image
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="h-12 w-12 text-slate-400" />
                                                        </div>
                                                    )}

                                                    {/* Token ID Badge */}
                                                    <div className="absolute top-3 left-3">
                                                        <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium">
                                                            #{nft.tokenId}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* NFT Info */}
                                                <div className="p-4">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">
                                                        {nft.metadata?.name || `NFT #${nft.tokenId}`}
                                                    </h4>
                                                    {nft.metadata?.description && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                                                            {nft.metadata.description}
                                                        </p>
                                                    )}

                                                    {/* Owner */}
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-500 dark:text-slate-400">Owner:</span>
                                                        <code className="text-slate-700 dark:text-slate-300 font-mono">
                                                            {formatAddress(nft.owner)}
                                                        </code>
                                                    </div>

                                                    {/* Attributes */}
                                                    {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                                            <div className="flex flex-wrap gap-1">
                                                                {nft.metadata.attributes.slice(0, 2).map((attr: { trait_type: string; value: string }, index: number) => (
                                                                    <div
                                                                        key={index}
                                                                        className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs"
                                                                    >
                                                                        <span className="text-slate-500 dark:text-slate-400">{attr.trait_type}:</span>
                                                                        <span className="text-slate-700 dark:text-slate-300 ml-1 font-medium">{attr.value}</span>
                                                                    </div>
                                                                ))}
                                                                {nft.metadata.attributes.length > 2 && (
                                                                    <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs text-slate-500 dark:text-slate-400">
                                                                        +{nft.metadata.attributes.length - 2} more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Transfer Button */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() => openTransferModal(nft)}
                                                    >
                                                        Transfer
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Enhanced Minting Section for ERC721 */}
                    {!isERC20 && isConnected && (
                        <Card className="mt-6 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-[var(--stark-orange)] rounded-xl flex items-center justify-center">
                                            <Plus className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <span className="text-xl font-bold text-[var(--stark-orange)]">
                                                Mint NFT
                                            </span>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                Create a unique digital asset
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setShowMintModal(true)}
                                        className="bg-[var(--stark-orange)] hover:bg-yellow-400 shadow-lg hover:shadow-xl transition-all duration-200"
                                        size="lg"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Start Minting
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    )}
                </div>

                {/* Enhanced Stats */}
                <div className="space-y-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                    {/* Total Supply Card */}
                    <Card className="card-web3 hover-glow-orange relative overflow-hidden">
                        <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
                        <CardContent className="p-6 relative">
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-[var(--stark-orange)] rounded-xl mx-auto mb-4 transform transition-transform hover:scale-110">
                                    <Coins className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-sm font-bold text-[var(--stark-gray)] mb-2 uppercase tracking-wider">
                                    Total Supply
                                </h3>
                                <p className="text-3xl font-bold text-[var(--stark-orange)]">
                                    {(() => {
                                        if (tokenData.type === 'ERC20') {
                                            const erc20Data = tokenData as ERC20TokenData;
                                            return formatAmount(erc20Data.totalSupply.toString(), erc20Data.decimals);
                                        }
                                        return nftCollection.length;
                                    })()}
                                </p>
                                <p className="text-xs text-[var(--stark-gray)] mt-1">
                                    {isERC20 ? 'Tokens' : 'NFTs Minted'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Collection Stats for NFTs */}
                    {!isERC20 && (
                        <Card className="relative overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-800">
                            <CardContent className="p-6 relative">
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 bg-[var(--stark-orange)] rounded-xl mx-auto mb-4">
                                        <ImageIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                                        Collection Size
                                    </h3>
                                    <p className="text-3xl font-bold text-[var(--stark-orange)]">
                                        {nftCollection.length}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Unique NFTs
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    {!isERC20 && isConnected && (
                        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-[var(--stark-orange)] rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <Plus className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                        Quick Mint
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        Create a new NFT instantly
                                    </p>
                                    <Button
                                        onClick={() => setShowMintModal(true)}
                                        className="w-full bg-[var(--stark-orange)] hover:bg-yellow-400"
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Mint NFT
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Mint NFT Modal */}
            <Dialog open={showMintModal} onOpenChange={setShowMintModal}>
                <DialogContent className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[var(--stark-orange)] rounded-xl flex items-center justify-center">
                                <Palette className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-[var(--stark-orange)]">
                                Mint NFT
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-8">
                        {/* Form Header */}
                        <div className="text-center py-6 bg-white dark:bg-slate-800 rounded-2xl border border-orange-100 dark:border-orange-800">
                            <div className="w-16 h-16 bg-[var(--stark-orange)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Palette className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Create Your NFT
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Upload an image and add metadata to mint your unique NFT
                            </p>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        NFT Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={mintFormData.name}
                                        onChange={(e) => setMintFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Cosmic Dragon #001"
                                        className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Recipient Address
                                    </label>
                                    <input
                                        type="text"
                                        value={mintFormData.recipient}
                                        onChange={(e) => setMintFormData(prev => ({ ...prev, recipient: e.target.value }))}
                                        placeholder="0x..."
                                        className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-mono text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Description *
                                </label>
                                <textarea
                                    value={mintFormData.description}
                                    onChange={(e) => setMintFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe what makes this NFT special..."
                                    rows={4}
                                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Upload NFT Image *
                                </label>

                                {/* Upload Area */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileInputRef}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        required
                                    />
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                                        <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <ImageIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                            Choose your NFT image
                                        </h4>
                                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Click or drag and drop your file here
                                        </p>
                                    </div>
                                </div>

                                {/* Upload Status */}
                                {uploadingImage && (
                                    <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl border border-orange-200 dark:border-orange-700">
                                        <div className="flex items-center space-x-3">
                                            <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                                            <div>
                                                <p className="font-medium text-orange-900 dark:text-orange-100">Uploading to IPFS...</p>
                                                <p className="text-sm text-orange-700 dark:text-orange-300">This may take a few moments</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {uploadingMetadata && (
                                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                        <div className="flex items-center space-x-3">
                                            <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                                            <div>
                                                <p className="font-medium text-yellow-900 dark:text-yellow-100">Creating metadata...</p>
                                                <p className="text-sm text-yellow-700 dark:text-yellow-300">Preparing your NFT data</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Image Preview */}
                                {nftImageUrl && !uploadingImage && (
                                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl border border-green-200 dark:border-green-700">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-green-900 dark:text-green-100 mb-3">
                                                    ✅ Image uploaded successfully!
                                                </p>
                                                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-green-200 dark:border-green-700">
                                                    <div className="relative w-full h-64">
                                                        <Image
                                                            src={nftImageUrl}
                                                            alt="NFT Preview"
                                                            fill
                                                            className="rounded-lg object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4 pt-6">
                                <Button
                                    onClick={handleMintNFT}
                                    disabled={isMinting || uploadingImage || uploadingMetadata || !nftImageUrl}
                                    className="flex-1 h-14 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-semibold"
                                    size="lg"
                                >
                                    {isMinting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            Minting NFT...
                                        </>
                                    ) : uploadingMetadata ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            Preparing...
                                        </>
                                    ) : (
                                        <>
                                            <Palette className="w-5 h-5 mr-3" />
                                            Mint NFT
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowMintModal(false)}
                                    disabled={isMinting || uploadingImage || uploadingMetadata}
                                    className="h-14 px-8 border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    size="lg"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Transfer Modal */}
            <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer NFT{selectedNft ? ` #${selectedNft.tokenId}` : ''}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Recipient Address"
                            value={transferAddress}
                            onChange={e => setTransferAddress(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                        />
                        <Button
                            onClick={handleTransferNFT}
                            disabled={isTransferring || !transferAddress}
                            className="w-full"
                        >
                            {isTransferring ? 'Transferring...' : 'Transfer'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ERC20 Mint Modal */}
            <Dialog open={showErc20MintModal} onOpenChange={setShowErc20MintModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mint {tokenData?.symbol} Tokens</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Recipient Address"
                            value={erc20MintRecipient}
                            onChange={e => setErc20MintRecipient(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                        />
                        <input
                            type="number"
                            placeholder={`Amount (${tokenData?.symbol})`}
                            value={erc20MintAmount}
                            onChange={e => setErc20MintAmount(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                        />
                        <Button
                            onClick={handleErc20Mint}
                            disabled={isErc20Minting || !erc20MintRecipient || !erc20MintAmount}
                            className="w-full"
                        >
                            {isErc20Minting ? 'Minting...' : 'Mint'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ERC20 Transfer Modal */}
            <Dialog open={showErc20TransferModal} onOpenChange={setShowErc20TransferModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer {tokenData?.symbol} Tokens</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Recipient Address"
                            value={erc20TransferRecipient}
                            onChange={e => setErc20TransferRecipient(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                        />
                        <input
                            type="number"
                            placeholder={`Amount (${tokenData?.symbol})`}
                            value={erc20TransferAmount}
                            onChange={e => setErc20TransferAmount(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                        />
                        <Button
                            onClick={handleErc20Transfer}
                            disabled={isErc20Transferring || !erc20TransferRecipient || !erc20TransferAmount}
                            className="w-full"
                        >
                            {isErc20Transferring ? 'Transferring...' : 'Transfer'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
