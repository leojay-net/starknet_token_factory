import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext'
import { getTokenFactoryContract, felt252ToString } from '@/lib/starknet';

export function useUserTokens() {
    const { account, address } = useWallet();
    const [userTokens, setUserTokens] = useState<any[]>([]);
    const [userStats, setUserStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!address) return;
        setLoading(true);
        setError(null);
        const fetchTokens = async () => {
            try {
                const contract = getTokenFactoryContract();
                // Use the correct contract method
                const tokensRaw = await contract.get_created_tokens(address);
                // tokensRaw is likely an object with a property (e.g. tokensRaw[0] or tokensRaw.tokens)
                // Try to parse it as an array of TokenInfo structs
                const tokens = (Array.isArray(tokensRaw) ? tokensRaw : tokensRaw[0] || tokensRaw.tokens || [])
                    .map((token: any) => ({
                        token_address: token.token_address,
                        token_type: token.token_type,
                        name: token.name ? felt252ToString(token.name.data?.[0] || token.name) : '',
                        symbol: token.symbol ? felt252ToString(token.symbol.data?.[0] || token.symbol) : '',
                        created_at: token.created_at
                    }));
                setUserTokens(tokens);
                // Optionally fetch stats
                if (contract.get_user_stats) {
                    const stats = await contract.get_user_stats(address);
                    setUserStats(stats);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch user tokens');
            } finally {
                setLoading(false);
            }
        };
        fetchTokens();
    }, [address]);

    return { userTokens, userStats, loading, error };
} 