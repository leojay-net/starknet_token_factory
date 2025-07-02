import { useEffect, useState } from 'react';
import { getTokenFactoryContract, felt252ToString } from '@/lib/starknet';

export function useTokenData(tokenAddress: string) {
    const [tokenData, setTokenData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tokenAddress) return;
        setLoading(true);
        setError(null);
        const fetchData = async () => {
            try {
                const contract = getTokenFactoryContract();
                // Assumes your contract has a get_token_info(address) method
                const data = await contract.get_token_info(tokenAddress);
                setTokenData({
                    ...data,
                    name: felt252ToString(data.name?.data?.[0] || data.name),
                    symbol: felt252ToString(data.symbol?.data?.[0] || data.symbol),
                });
            } catch (err: any) {
                setError(err.message || 'Failed to fetch token data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tokenAddress]);

    return { tokenData, loading, error };
} 