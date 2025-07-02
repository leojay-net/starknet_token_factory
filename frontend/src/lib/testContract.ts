import { Contract, RpcProvider, CallData } from 'starknet'

// Test contract interaction with deployed contract
const TEST_CONTRACT_ADDRESS = '0x02197940985f5fafcf93e618571b8b961a2290eb8621c24c4c5b066c4efc2b43'
const ERC20_CLASS_HASH = '0x04fa600e3c3f6c5fbddf085f6260730310adb84b7118d3e6a967d4de22c1af0a'
const ERC721_CLASS_HASH = '0x0345d9a2cb150876a5a8bd0fd3ca1b5d7614d1f7f8e664a7f4aa9bed862fa7ce'

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
