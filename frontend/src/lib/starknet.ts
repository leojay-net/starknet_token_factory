import { Contract, RpcProvider, Account, CallData, constants } from 'starknet';
import { CONTRACT_ADDRESSES, NETWORKS, DEFAULT_NETWORK, TOKEN_FACTORY_ABI, ERC20_ABI, ERC721_ABI } from './constants';

// Contract configuration
export const TOKEN_FACTORY_ADDRESS = CONTRACT_ADDRESSES.TOKEN_FACTORY;
export const RPC_URL = NETWORKS[DEFAULT_NETWORK].rpcUrl;

console.log('🌐 starknet: Initializing provider with config:', {
    tokenFactoryAddress: TOKEN_FACTORY_ADDRESS,
    rpcUrl: RPC_URL,
    network: DEFAULT_NETWORK,
    chainId: constants.StarknetChainId.SN_SEPOLIA
});

export const provider = new RpcProvider({
    nodeUrl: RPC_URL,
    chainId: constants.StarknetChainId.SN_SEPOLIA
});

console.log('✅ starknet: Provider created successfully');


export function getTokenFactoryContract(account?: Account) {
    console.log('🏭 starknet: getTokenFactoryContract called with:', {
        hasAccount: !!account,
        accountAddress: account?.address,
        tokenFactoryAddress: TOKEN_FACTORY_ADDRESS,
        rpcUrl: RPC_URL,
        hasProvider: !!provider
    });

    const contract = new Contract(TOKEN_FACTORY_ABI, TOKEN_FACTORY_ADDRESS, account || provider);

    console.log('✅ starknet: Contract created:', {
        contractAddress: contract.address,
        hasContract: !!contract,
        providerType: account ? 'account' : 'provider'
    });

    return contract;
}

export function getERC20Contract(tokenAddress: string, account?: Account) {
    const provider = new RpcProvider({
        nodeUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/kwgGr9GGk4YyLXuGfEvpITv1jpvn3PgP",
        chainId: constants.StarknetChainId.SN_SEPOLIA,
    });

    return new Contract(ERC20_ABI, tokenAddress, account || provider);
}

export function getERC721Contract(tokenAddress: string, account?: Account) {
    const provider = new RpcProvider({
        nodeUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/kwgGr9GGk4YyLXuGfEvpITv1jpvn3PgP",
        chainId: constants.StarknetChainId.SN_SEPOLIA,
    });

    return new Contract(ERC721_ABI, tokenAddress, account || provider);
}

export function stringToFelt252(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

export function felt252ToString(felt: string | bigint): string {
    const hex = typeof felt === 'bigint' ? felt.toString(16) : felt.replace('0x', '');
    return Buffer.from(hex, 'hex').toString('utf8').replace(/\0/g, '');
}

export function u256ToBigInt(u256: any): bigint {
    if (typeof u256 === 'bigint') return u256;
    if (typeof u256 === 'object' && u256.low !== undefined && u256.high !== undefined) {
        return (BigInt(u256.high) << BigInt(128)) + BigInt(u256.low);
    }
    return BigInt(u256);
}

export interface TokenInfo {
    address: string;
    name: string;
    symbol: string;
    type: 'ERC20' | 'ERC721';
    decimals?: number;
    totalSupply?: bigint;
    baseUri?: string;
}

// Utility to encode a JS string to Cairo ByteArray format
export function encodeByteArray(str: string) {
    // Cairo ByteArray is a struct: { data: Array<bytes31>, pending_word: felt252, pending_word_len: u32 }
    // For Starknet.js, we need to pass it as an object with the correct structure
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    // For short strings, we can fit them in a single bytes31 (31 bytes)
    if (bytes.length <= 31) {
        const bytes31 = new Uint8Array(31);
        bytes31.set(bytes);
        const dataFelt = '0x' + Array.from(bytes31).map(b => b.toString(16).padStart(2, '0')).join('');

        return {
            data: [dataFelt], // Array of 1 felt252
            pending_word: '0x0',
            pending_word_len: '0'
        };
    } else {
        // For longer strings, we'd need to split into multiple bytes31
        // For now, let's truncate to 31 bytes to keep it simple
        const truncatedBytes = bytes.slice(0, 31);
        const bytes31 = new Uint8Array(31);
        bytes31.set(truncatedBytes);
        const dataFelt = '0x' + Array.from(bytes31).map(b => b.toString(16).padStart(2, '0')).join('');

        return {
            data: [dataFelt],
            pending_word: '0x0',
            pending_word_len: '0'
        };
    }
}

// Alternative encoding for ByteArray using CallData
export function encodeByteArrayWithCallData(str: string) {
    // Use Starknet.js CallData to properly encode ByteArray
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    // Convert bytes to hex string
    const hexString = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // For ByteArray, we need to encode it as a struct with data array, pending_word, and pending_word_len
    // This is a simplified approach - for production, you might want to handle longer strings properly
    return {
        data: [hexString], // Array of bytes31 (felt252)
        pending_word: '0x0',
        pending_word_len: bytes.length.toString()
    };
}

// Utility to encode a JS string to Cairo ByteArray struct for CallData.compile
export function encodeByteArrayForCallData(str: string) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    // For short strings, fit in a single bytes31 (31 bytes)
    const bytes31 = new Uint8Array(31);
    bytes31.set(bytes.slice(0, 31));
    const dataFelt = '0x' + Array.from(bytes31).map(b => b.toString(16).padStart(2, '0')).join('');
    return {
        data: [dataFelt],
        pending_word: '0x0',
        pending_word_len: bytes.length.toString()
    };
}

// Utility to convert bigint to u256 struct for CallData.compile
export function bigIntToU256(value: bigint) {
    const low = value & ((BigInt(1) << BigInt(128)) - BigInt(1));
    const high = value >> BigInt(128);
    return {
        low: low.toString(),
        high: high.toString()
    };
}

/**
 * Extracts the token address from a TokenCreated event in a Starknet transaction receipt.
 * @param receipt The transaction receipt object from provider.getTransactionReceipt
 * @returns The token address as a string, or null if not found
 */
export function extractTokenAddressFromReceipt(receipt: any): string | null {
    if (!receipt?.events) {
        console.log('No events in receipt:', receipt);
        return null;
    }

    console.log('Receipt events:', receipt.events);

    // Look for TokenCreated event
    const event = receipt.events.find((e: any) => {
        // Check if event name matches TokenCreated
        if (e.name && e.name === 'TokenCreated') return true;

        // Check if any key contains TokenCreated hash
        if (e.keys && Array.isArray(e.keys)) {
            // The event selector for TokenCreated might be the first key
            return e.keys.some((k: string) =>
                k.toLowerCase().includes('tokencreated') ||
                // Add potential event selector hash for TokenCreated
                k === '0x2db2b0215b8e7c3f9ed2d3a9b5c8e6f4a7d9b3c1e5f8a2d4c7b0e3f6a9c2d5e8'
            );
        }

        return false;
    });

    if (!event) {
        console.log('TokenCreated event not found in events');
        return null;
    }

    console.log('Found TokenCreated event:', event);

    // Extract token address from event data
    if (event.data && Array.isArray(event.data) && event.data.length >= 2) {
        // Typically: [creator_address, token_address, token_type, ...]
        const tokenAddress = event.data[1];
        console.log('Extracted token address:', tokenAddress);
        return tokenAddress;
    }

    // If using named fields (some providers might structure it differently)
    if (event.token_address) {
        return event.token_address;
    }

    console.log('Could not extract token address from event data');
    return null;
}
