import { useEffect, useState, useCallback } from 'react';
import { getTokenFactoryContract } from '@/lib/starknet';
import { useWallet } from '@/contexts/WalletContext';

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

interface RawTokenData {
    name?: { data?: string[] };
    symbol?: { data?: string[] };
    token_address?: string | number;
    token_type?: string | number;
    created_at?: string | number;
}

export function useGlobalTokens() {
    const { address } = useWallet();
    const [allTokens, setAllTokens] = useState<TokenInfo[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGlobalTokens = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching global tokens...');
            const contract = getTokenFactoryContract();

            // Get total count first
            const totalCount = await contract.call('get_total_tokens_created', []);
            console.log('Total tokens created:', totalCount);

            let allUserTokens: TokenInfo[] = [];

            // If user is connected, at least show their tokens
            if (address) {
                try {
                    const userTokensRaw = await contract.call('get_created_tokens', [address]);
                    console.log('User tokens:', userTokensRaw);

                    if (Array.isArray(userTokensRaw)) {
                        allUserTokens = userTokensRaw.map((token: RawTokenData) => {
                            console.log('Processing token:', token);

                            // Handle ByteArray name and symbol
                            let name = '';
                            let symbol = '';

                            try {
                                if (token.name?.data?.[0]) {
                                    name = Buffer.from(token.name.data[0].replace('0x', ''), 'hex')
                                        .toString('utf8')
                                        .replace(/\0/g, '');
                                }

                                if (token.symbol?.data?.[0]) {
                                    symbol = Buffer.from(token.symbol.data[0].replace('0x', ''), 'hex')
                                        .toString('utf8')
                                        .replace(/\0/g, '');
                                }
                            } catch (parseError) {
                                console.warn('Error parsing name/symbol:', parseError);
                                name = 'Unknown';
                                symbol = 'UNK';
                            }

                            // Ensure token address is in hex format and string
                            let tokenAddress = token.token_address || '';
                            tokenAddress = String(tokenAddress);
                            if (tokenAddress && !tokenAddress.startsWith('0x')) {
                                tokenAddress = '0x' + BigInt(tokenAddress).toString(16);
                            }

                            return {
                                token_address: tokenAddress,
                                token_type: parseInt(token.token_type?.toString() || '0'),
                                name,
                                symbol,
                                created_at: token.created_at?.toString() || Date.now().toString()
                            };
                        });
                    }
                } catch (userTokensError) {
                    console.warn('Error fetching user tokens:', userTokensError);
                }
            }

            setAllTokens(allUserTokens);

            const stats: GlobalStats = {
                total_tokens: parseInt(totalCount.toString()),
                total_erc20: allUserTokens.filter(t => t.token_type === 0).length,
                total_erc721: allUserTokens.filter(t => t.token_type === 1).length,
                total_transactions: allUserTokens.length, // Each token creation is a transaction
                active_users: address ? 1 : 0 // We can only count the current user
            };

            console.log('Calculated stats:', stats);
            setGlobalStats(stats);

        } catch (err: unknown) {
            console.error('Error fetching global tokens:', err);
            setError((err as Error).message || 'Failed to fetch global tokens');
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchGlobalTokens();
    }, [fetchGlobalTokens]);

    const refresh = () => {
        fetchGlobalTokens();
    };

    return { allTokens, globalStats, loading, error, refresh };
}
