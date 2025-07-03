export interface TokenInfo {
    token_address: string;
    token_type: 0 | 1; // 0 for ERC20, 1 for ERC721
    name: string;
    symbol: string;
    created_at: number;
}

export interface ERC20TokenData {
    address: string;
    type: 'ERC20';
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: bigint;
}

export interface NFTMetadata {
    name?: string;
    symbol?: string;
    description?: string;
    image?: string;
    external_url?: string;
    attributes?: Array<{
        trait_type: string;
        value: string | number;
    }>;
}

export interface ERC721TokenData {
    address: string;
    type: 'ERC721';
    name: string;
    symbol: string;
    baseUri: string;
    metadata?: NFTMetadata;
    tokenUri?: string;
}

export interface TokenTransaction {
    hash: string;
    from: string;
    to: string;
    amount?: string;
    token_id?: string;
    timestamp: number;
    block_number: number;
}

export interface UserStats {
    total_tokens_created: number;
    erc20_tokens: number;
    erc721_tokens: number;
    total_transactions: number;
}

export interface GlobalStats {
    total_tokens: number;
    total_erc20: number;
    total_erc721: number;
    total_transactions: number;
    active_users: number;
}

export interface CreateTokenFormData {
    type: 'erc20' | 'erc721';
    name: string;
    symbol: string;
    decimals?: number;
    initial_supply?: string;
    base_uri?: string;
}
