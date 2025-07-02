import { useEffect, useState } from 'react';
import { getTokenFactoryContract } from '@/lib/starknet';

interface TokenInfo {
    token_address: string;
    token_type: number;
    name: string;
    symbol: string;
    created_at: string;
}

interface GlobalStats {
    total_tokens: number;
    total_erc20: number;
    total_erc721: number;
    total_transactions: number;
    active_users: number;
}

export function useGlobalTokens() {
    const [allTokens, setAllTokens] = useState<TokenInfo[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchGlobalTokens();
    }, []);

    const fetchGlobalTokens = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching global tokens...');
            const contract = getTokenFactoryContract();

            // Get total count first
            const totalCount = await contract.call('get_total_tokens_created', []);
            console.log('Total tokens created:', totalCount);

            // For now, we'll return empty since we don't have a method to get all tokens
            // In a real implementation, you'd need a contract method to get all tokens
            // or iterate through known creators

            setAllTokens([]);

            const stats: GlobalStats = {
                total_tokens: parseInt(totalCount.toString()),
                total_erc20: 0, // Would need to calculate from actual data
                total_erc721: 0, // Would need to calculate from actual data
                total_transactions: 0, // Would need event indexing
                active_users: 0 // Would need to track unique creators
            };

            setGlobalStats(stats);

        } catch (err: any) {
            console.error('Error fetching global tokens:', err);
            setError(err.message || 'Failed to fetch global tokens');
        } finally {
            setLoading(false);
        }
    };

    const refresh = () => {
        fetchGlobalTokens();
    };

    return { allTokens, globalStats, loading, error, refresh };
}
