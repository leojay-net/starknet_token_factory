import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext'
import { getTokenFactoryContract } from '@/lib/starknet';

interface TokenInfo {
    token_address: string;
    token_type: number;
    name: string;
    symbol: string;
    created_at: string;
}

interface UserStats {
    total_tokens_created: number;
    erc20_tokens: number;
    erc721_tokens: number;
    total_transactions: number;
}

export function useUserTokens() {
    const { account, address } = useWallet();
    const [userTokens, setUserTokens] = useState<TokenInfo[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTokens = async () => {
        if (!address) {
            setUserTokens([]);
            setUserStats(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Fetching tokens for address:', address);
            const contract = getTokenFactoryContract();

            // Call get_created_tokens with the user's address
            const tokensRaw = await contract.call('get_created_tokens', [address]);
            console.log('Raw tokens response:', tokensRaw);

            // Parse the response - it should be an array of TokenInfo structs
            let tokens: TokenInfo[] = [];

            // Handle different response formats
            if (tokensRaw && typeof tokensRaw === 'object') {
                let tokenArray: any = tokensRaw;

                // If it's wrapped in an array, unwrap it
                if (Array.isArray(tokensRaw) && tokensRaw.length === 1 && Array.isArray(tokensRaw[0])) {
                    tokenArray = tokensRaw[0];
                } else if (!Array.isArray(tokensRaw)) {
                    // If it's an object, look for common array properties
                    tokenArray = (tokensRaw as any).tokens || (tokensRaw as any).data || (tokensRaw as any)[0] || [];
                }

                console.log('Processing token array:', tokenArray);

                if (Array.isArray(tokenArray)) {
                    tokens = tokenArray.map((token: any, index: number) => {
                        console.log(`Processing token ${index}:`, token);

                        // Handle ByteArray name and symbol
                        let name = '';
                        let symbol = '';

                        try {
                            // ByteArray structure: { data: Array<bytes31>, pending_word: felt252, pending_word_len: u32 }
                            if (token.name?.data?.[0]) {
                                // Convert hex to string, removing null bytes
                                const hexString = token.name.data[0].replace('0x', '');
                                if (hexString && hexString !== '0') {
                                    name = Buffer.from(hexString, 'hex')
                                        .toString('utf8')
                                        .replace(/\0/g, '');
                                }
                            }

                            if (token.symbol?.data?.[0]) {
                                const hexString = token.symbol.data[0].replace('0x', '');
                                if (hexString && hexString !== '0') {
                                    symbol = Buffer.from(hexString, 'hex')
                                        .toString('utf8')
                                        .replace(/\0/g, '');
                                }
                            }

                            // Fallback names if parsing failed
                            if (!name) name = `Token ${index + 1}`;
                            if (!symbol) symbol = `TK${index + 1}`;

                        } catch (e) {
                            console.warn('Error parsing name/symbol for token:', token, e);
                            name = `Token ${index + 1}`;
                            symbol = `TK${index + 1}`;
                        }

                        return {
                            token_address: (() => {
                                let addr = token.token_address || `0x${index}`;
                                // Convert to string first if it's not already
                                addr = String(addr);
                                // Ensure address is in hex format
                                if (!addr.startsWith('0x') && addr !== `0x${index}`) {
                                    try {
                                        addr = '0x' + BigInt(addr).toString(16);
                                    } catch (e) {
                                        console.warn('Could not convert address to hex:', addr, e);
                                        addr = `0x${index}`;
                                    }
                                }
                                return addr;
                            })(),
                            token_type: parseInt(token.token_type?.toString() || '0'),
                            name,
                            symbol,
                            created_at: token.created_at?.toString() || Date.now().toString()
                        };
                    });
                }
            }

            console.log('Parsed tokens:', tokens);
            setUserTokens(tokens);

            // Calculate stats from the tokens
            const stats: UserStats = {
                total_tokens_created: tokens.length,
                erc20_tokens: tokens.filter(t => t.token_type === 0).length,
                erc721_tokens: tokens.filter(t => t.token_type === 1).length,
                total_transactions: tokens.length // Each token creation is a transaction
            };

            console.log('Calculated stats:', stats);
            setUserStats(stats);

        } catch (err: any) {
            console.error('Error fetching user tokens:', err);
            setError(err.message || 'Failed to fetch user tokens');

            // Set empty data on error
            setUserTokens([]);
            setUserStats({
                total_tokens_created: 0,
                erc20_tokens: 0,
                erc721_tokens: 0,
                total_transactions: 0
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTokens();
    }, [address]);

    const refresh = () => {
        fetchTokens();
    };

    return { userTokens, userStats, loading, error, refresh };
} 