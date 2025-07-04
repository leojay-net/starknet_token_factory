import { Contract, RpcProvider, Account, constants } from 'starknet';
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


export function getTokenFactoryContract(account?: Account | unknown) {
    console.log('🏭 starknet: getTokenFactoryContract called with:', {
        hasAccount: !!account,
        accountAddress: (account as Account)?.address,
        tokenFactoryAddress: TOKEN_FACTORY_ADDRESS,
        rpcUrl: RPC_URL,
        hasProvider: !!provider
    });

    const contract = new Contract(TOKEN_FACTORY_ABI, TOKEN_FACTORY_ADDRESS, (account as Account) || provider);

    console.log('✅ starknet: Contract created:', {
        contractAddress: contract.address,
        hasContract: !!contract,
        providerType: account ? 'account' : 'provider'
    });

    return contract;
}

export function getERC20Contract(tokenAddress: string, account?: Account | unknown) {
    const provider = new RpcProvider({
        nodeUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/kwgGr9GGk4YyLXuGfEvpITv1jpvn3PgP",
        chainId: constants.StarknetChainId.SN_SEPOLIA,
    });

    return new Contract(ERC20_ABI, tokenAddress, (account as Account) || provider);
}

export function getERC721Contract(tokenAddress: string, account?: Account | unknown) {
    const provider = new RpcProvider({
        nodeUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/kwgGr9GGk4YyLXuGfEvpITv1jpvn3PgP",
        chainId: constants.StarknetChainId.SN_SEPOLIA,
    });

    return new Contract(ERC721_ABI, tokenAddress, (account as Account) || provider);
}

export function stringToFelt252(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

export function felt252ToString(felt: string | bigint): string {
    const hex = typeof felt === 'bigint' ? felt.toString(16) : felt.replace('0x', '');
    return Buffer.from(hex, 'hex').toString('utf8').replace(/\0/g, '');
}

export function u256ToBigInt(u256: unknown): bigint {
    if (typeof u256 === 'bigint') return u256;
    if (typeof u256 === 'object' && u256 && 'low' in u256 && 'high' in u256) {
        const u256Obj = u256 as { low: string | number; high: string | number };
        return (BigInt(u256Obj.high) << BigInt(128)) + BigInt(u256Obj.low);
    }
    return BigInt(u256 as string | number);
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
    console.log('=== ENCODING BYTEARRAY ===');
    console.log('Input string:', str);
    console.log('Input string length:', str.length);

    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    console.log('Encoded bytes length:', bytes.length);
    console.log('Encoded bytes:', Array.from(bytes));

    const dataArray = [];
    let pendingWord = '0x0';
    let pendingWordLen = 0;

    // Process bytes in chunks of 31 (bytes31 size)
    let offset = 0;
    while (offset < bytes.length) {
        const chunkSize = Math.min(31, bytes.length - offset);
        console.log(`Processing chunk at offset ${offset}, size: ${chunkSize}`);

        if (chunkSize === 31) {
            // Full chunk - add to data array
            const chunk = bytes.slice(offset, offset + 31);
            const bytes31 = new Uint8Array(31);
            bytes31.set(chunk);
            const dataFelt = '0x' + Array.from(bytes31).map(b => b.toString(16).padStart(2, '0')).join('');
            console.log(`Full chunk ${dataArray.length}: ${dataFelt}`);
            console.log(`Chunk decoded: "${Buffer.from(chunk).toString('utf8')}"`);
            dataArray.push(dataFelt);
            offset += 31;
        } else {
            // Partial chunk - this becomes the pending word
            const chunk = bytes.slice(offset);
            const hexString = '0x' + Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(62, '0'); // Pad to 31 bytes
            pendingWord = hexString;
            pendingWordLen = chunk.length;
            console.log(`Pending word: ${pendingWord} (length: ${pendingWordLen})`);
            console.log(`Pending chunk decoded: "${Buffer.from(chunk).toString('utf8')}"`);
            break;
        }
    }

    console.log('Final data array length:', dataArray.length);
    console.log('Final pending word length:', pendingWordLen);
    console.log('=== END ENCODING ===');

    return {
        data: dataArray,
        pending_word: pendingWord,
        pending_word_len: pendingWordLen.toString()
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

// Utility to extract token address from transaction receipt
export function extractTokenAddressFromReceipt(receipt: unknown): string | null {
    console.log('🔍 extractTokenAddressFromReceipt: Analyzing receipt:', receipt);

    if (!receipt || typeof receipt !== 'object') {
        console.log('❌ extractTokenAddressFromReceipt: Invalid receipt format');
        return null;
    }

    const receiptObj = receipt as { events?: unknown[] };
    if (!receiptObj.events || !Array.isArray(receiptObj.events)) {
        console.log('❌ extractTokenAddressFromReceipt: No events array found');
        return null;
    }

    console.log('🔍 extractTokenAddressFromReceipt: Found events:', receiptObj.events.length);

    for (const event of receiptObj.events) {
        if (!event || typeof event !== 'object') continue;

        const eventObj = event as { name?: string; data?: unknown[] };
        console.log('🔍 extractTokenAddressFromReceipt: Processing event:', eventObj.name);

        if (eventObj.name === 'TokenCreated' && eventObj.data && Array.isArray(eventObj.data) && eventObj.data.length > 0) {
            const tokenAddress = eventObj.data[0];
            console.log('✅ extractTokenAddressFromReceipt: Found TokenCreated event with address:', tokenAddress);
            return String(tokenAddress);
        }
    }

    console.log('❌ extractTokenAddressFromReceipt: No TokenCreated event found');
    return null;
}

// Function to fetch all tokens from the factory
export async function fetchAllTokens() {
    try {
        console.log('🌐 fetchAllTokens: Starting fetch...');
        const contract = getTokenFactoryContract();
        
        // Use the get_all_tokens function which returns all tokens created by the factory
        const result = await contract.call('get_all_tokens', []);
        console.log('🌐 fetchAllTokens: All tokens result:', result);
        
        return result;
        
    } catch (error) {
        console.error('❌ fetchAllTokens: Error:', error);
        throw error;
    }
}
