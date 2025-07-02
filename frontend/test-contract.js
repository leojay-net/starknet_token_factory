const { Contract, RpcProvider, constants } = require('starknet');

// Test configuration
const CONTRACT_ADDRESS = '0x02197940985f5fafcf93e618571b8b961a2290eb8621c24c4c5b066c4efc2b43';
const RPC_URL = 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7';

// Simple ABI for testing
const SIMPLE_ABI = [
    {
        "name": "get_total_tokens_created",
        "type": "function",
        "inputs": [],
        "outputs": [{ "type": "core::integer::u32" }],
        "state_mutability": "view"
    }
];

// ByteArray encoding function
function encodeByteArray(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    // Convert bytes to hex string
    const hexString = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

    return {
        data: [hexString], // Array of bytes31 (felt252)
        pending_word: '0x0',
        pending_word_len: bytes.length.toString()
    };
}

async function testContract() {
    try {
        console.log('🔍 Testing contract deployment...');

        const provider = new RpcProvider({
            nodeUrl: RPC_URL,
            chainId: constants.StarknetChainId.SN_SEPOLIA
        });

        const contract = new Contract(SIMPLE_ABI, CONTRACT_ADDRESS, provider);

        console.log('📋 Contract details:', {
            address: contract.address,
            provider: provider.nodeUrl
        });

        // Test a simple read function
        console.log('📞 Calling get_total_tokens_created...');
        const result = await contract.call('get_total_tokens_created', []);
        console.log('✅ Contract call successful:', result);

        // Test ByteArray encoding
        console.log('\n🔤 Testing ByteArray encoding...');
        const testString = 'My Token';
        const encoded = encodeByteArray(testString);
        console.log('Original string:', testString);
        console.log('Encoded ByteArray:', encoded);

        return true;
    } catch (error) {
        console.error('❌ Contract test failed:', error);
        return false;
    }
}

// Run the test
testContract().then(success => {
    if (success) {
        console.log('\n🎉 Contract test completed successfully!');
    } else {
        console.log('\n💥 Contract test failed!');
        process.exit(1);
    }
}); 