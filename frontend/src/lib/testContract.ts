import { Contract, RpcProvider } from 'starknet'

// Test contract interaction with deployed contract
const TEST_CONTRACT_ADDRESS = '0x03e63a14c0048742873a97d8bba18de5cec7d54acf6f8a560b2afce3ae1ef534'

const TOKEN_FACTORY_ABI = [
    {
        "name": "get_total_tokens_created",
        "type": "function",
        "inputs": [],
        "outputs": [{ "type": "core::integer::u32" }],
        "state_mutability": "view"
    },
    {
        "name": "create_erc20",
        "type": "function",
        "inputs": [
            { "name": "name", "type": "core::byte_array::ByteArray" },
            { "name": "symbol", "type": "core::byte_array::ByteArray" },
            { "name": "decimals", "type": "core::integer::u8" },
            { "name": "initial_supply", "type": "core::integer::u256" }
        ],
        "outputs": [{ "type": "core::starknet::contract_address::ContractAddress" }],
        "state_mutability": "external"
    }
]

const provider = new RpcProvider({
    nodeUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7'
})

async function testContractRead() {
    try {
        console.log('Testing contract read...')
        const contract = new Contract(TOKEN_FACTORY_ABI, TEST_CONTRACT_ADDRESS, provider)

        // Test a simple read function
        const totalTokens = await contract.call('get_total_tokens_created', [])
        console.log('Total tokens created:', totalTokens)

        return totalTokens
    } catch (error) {
        console.error('Error testing contract read:', error)
        throw error
    }
}

// Export for use in frontend
export { testContractRead }
