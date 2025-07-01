import { ContractConfig } from '@/types'

export const CONTRACT_CONFIG: ContractConfig = {
    factoryAddress: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x1234567890abcdef1234567890abcdef12345678',
    erc20ClassHash: process.env.NEXT_PUBLIC_ERC20_CLASS_HASH || '0xabcdef1234567890abcdef1234567890abcdef12',
    erc721ClassHash: process.env.NEXT_PUBLIC_ERC721_CLASS_HASH || '0x567890abcdef1234567890abcdef1234567890ab',
    network: (process.env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'testnet') || 'testnet'
}

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://starknet-testnet.public.blastapi.io'

export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://testnet.starkscan.co'

export const APP_CONFIG = {
    name: 'Token Factory',
    description: 'Create and deploy ERC20 and ERC721 tokens on Starknet without coding.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://token-factory.vercel.app',
    version: '1.0.0'
}
