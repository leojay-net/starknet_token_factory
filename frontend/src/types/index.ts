export interface TokenInfo {
    token_address: string
    token_type: number // 0 for ERC20, 1 for ERC721
    name: string
    symbol: string
    created_at: number
}

export interface ERC20TokenDetails extends TokenInfo {
    decimals: number
    total_supply: string
    creator: string
}

export interface ERC721TokenDetails extends TokenInfo {
    base_uri: string
    total_supply: number
    creator: string
}

export interface Transaction {
    hash: string
    from: string
    to: string
    value: string
    timestamp: number
    token_address: string
    token_symbol: string
    type: 'transfer' | 'mint' | 'burn'
}

export interface DashboardStats {
    totalTokensCreated: number
    totalERC20Tokens: number
    totalERC721Tokens: number
    totalTransactions: number
    totalVolume: string
}

export interface UserStats {
    tokensCreated: number
    erc20Count: number
    erc721Count: number
    totalTransactions: number
    tokens: TokenInfo[]
}

export interface ContractConfig {
    factoryAddress: string
    erc20ClassHash: string
    erc721ClassHash: string
    network: 'mainnet' | 'testnet'
}
