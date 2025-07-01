import { Contract, RpcProvider, CallData } from 'starknet'
import { TokenInfo, ERC20TokenDetails, ERC721TokenDetails, Transaction } from '@/types'

const FACTORY_ABI = [
    {
        "name": "create_erc20",
        "type": "function",
        "inputs": [
            { "name": "name", "type": "felt252" },
            { "name": "symbol", "type": "felt252" },
            { "name": "decimals", "type": "u8" },
            { "name": "initial_supply", "type": "u256" }
        ],
        "outputs": [{ "name": "token_address", "type": "felt252" }],
        "state_mutability": "external"
    },
    {
        "name": "create_erc721",
        "type": "function",
        "inputs": [
            { "name": "name", "type": "felt252" },
            { "name": "symbol", "type": "felt252" },
            { "name": "base_uri", "type": "felt252" }
        ],
        "outputs": [{ "name": "token_address", "type": "felt252" }],
        "state_mutability": "external"
    },
    {
        "name": "get_created_tokens",
        "type": "function",
        "inputs": [{ "name": "creator", "type": "felt252" }],
        "outputs": [{ "name": "tokens", "type": "TokenInfo*" }],
        "state_mutability": "view"
    },
    {
        "name": "get_token_count",
        "type": "function",
        "inputs": [{ "name": "creator", "type": "felt252" }],
        "outputs": [{ "name": "count", "type": "u32" }],
        "state_mutability": "view"
    },
    {
        "name": "get_total_tokens_created",
        "type": "function",
        "inputs": [],
        "outputs": [{ "name": "total", "type": "u32" }],
        "state_mutability": "view"
    }
]

const ERC20_ABI = [
    {
        "name": "name",
        "type": "function",
        "inputs": [],
        "outputs": [{ "name": "name", "type": "felt252" }],
        "state_mutability": "view"
    },
    {
        "name": "symbol",
        "type": "function",
        "inputs": [],
        "outputs": [{ "name": "symbol", "type": "felt252" }],
        "state_mutability": "view"
    },
    {
        "name": "decimals",
        "type": "function",
        "inputs": [],
        "outputs": [{ "name": "decimals", "type": "u8" }],
        "state_mutability": "view"
    },
    {
        "name": "total_supply",
        "type": "function",
        "inputs": [],
        "outputs": [{ "name": "total_supply", "type": "u256" }],
        "state_mutability": "view"
    }
]

class TokenFactoryService {
    private provider: RpcProvider
    private factoryContract: Contract

    constructor(providerUrl: string, factoryAddress: string) {
        this.provider = new RpcProvider({ nodeUrl: providerUrl })
        this.factoryContract = new Contract(FACTORY_ABI, factoryAddress, this.provider)
    }

    async createERC20Token(
        account: any,
        name: string,
        symbol: string,
        decimals: number,
        initialSupply: string
    ): Promise<string> {
        const call = this.factoryContract.populate('create_erc20', {
            name,
            symbol,
            decimals,
            initial_supply: initialSupply
        })

        const result = await account.execute(call)
        return result.transaction_hash
    }

    async createERC721Token(
        account: any,
        name: string,
        symbol: string,
        baseUri: string
    ): Promise<string> {
        const call = this.factoryContract.populate('create_erc721', {
            name,
            symbol,
            base_uri: baseUri
        })

        const result = await account.execute(call)
        return result.transaction_hash
    }

    async getUserTokens(userAddress: string): Promise<TokenInfo[]> {
        try {
            const result = await this.factoryContract.call('get_created_tokens', [userAddress])
            return result as TokenInfo[]
        } catch (error) {
            console.error('Error fetching user tokens:', error)
            return []
        }
    }

    async getTotalTokensCreated(): Promise<number> {
        try {
            const result = await this.factoryContract.call('get_total_tokens_created', [])
            return Number(result)
        } catch (error) {
            console.error('Error fetching total tokens:', error)
            return 0
        }
    }

    async getERC20TokenDetails(tokenAddress: string): Promise<ERC20TokenDetails | null> {
        try {
            const tokenContract = new Contract(ERC20_ABI, tokenAddress, this.provider)

            const [name, symbol, decimals, totalSupply] = await Promise.all([
                tokenContract.call('name', []),
                tokenContract.call('symbol', []),
                tokenContract.call('decimals', []),
                tokenContract.call('total_supply', [])
            ])

            return {
                token_address: tokenAddress,
                token_type: 0,
                name: name as string,
                symbol: symbol as string,
                decimals: Number(decimals),
                total_supply: totalSupply.toString(),
                creator: '', // Would need to be fetched from factory
                created_at: 0
            }
        } catch (error) {
            console.error('Error fetching ERC20 details:', error)
            return null
        }
    }

    async getTokenTransactions(tokenAddress: string): Promise<Transaction[]> {
        // This would typically involve indexing blockchain events
        // For now, returning mock data - you'd integrate with a blockchain indexer
        return []
    }
}

export default TokenFactoryService
