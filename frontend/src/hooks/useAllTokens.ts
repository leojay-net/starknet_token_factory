import { useEffect, useState } from 'react';
import { fetchAllTokens } from '@/lib/starknet';

interface TokenData {
  token_address: string;
  token_type: number;
  name: string;
  symbol: string;
  created_at: string;
}

interface RawTokenData {
  name?: { data?: string[] };
  symbol?: { data?: string[] };
  token_address?: string | number;
  token_type?: string | number;
  created_at?: string | number;
}

export function useAllTokens() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAllTokens()
      .then((result) => {
        let tokenArray: RawTokenData[] = [];
        if (Array.isArray(result)) {
          tokenArray = result.filter((t): t is RawTokenData => typeof t === 'object' && t !== null);
        }
        // Parse and map tokens
        const parsedTokens = tokenArray.map((token: RawTokenData, index: number) => {
          // Decode name and symbol from ByteArray
          let name = '';
          let symbol = '';
          try {
            if (token.name?.data?.[0]) {
              const hexString = token.name.data[0].replace('0x', '');
              if (hexString && hexString !== '0') {
                name = Buffer.from(hexString, 'hex').toString('utf8').replace(/\0/g, '');
              }
            }
            if (token.symbol?.data?.[0]) {
              const hexString = token.symbol.data[0].replace('0x', '');
              if (hexString && hexString !== '0') {
                symbol = Buffer.from(hexString, 'hex').toString('utf8').replace(/\0/g, '');
              }
            }
            if (!name) name = `Token ${index + 1}`;
            if (!symbol) symbol = `TK${index + 1}`;
          } catch {
            name = `Token ${index + 1}`;
            symbol = `TK${index + 1}`;
          }
          // Format address
          let addr = token.token_address || `0x${index}`;
          addr = String(addr);
          if (!addr.startsWith('0x') && addr !== `0x${index}`) {
            try {
              addr = '0x' + BigInt(addr).toString(16);
            } catch {
              addr = `0x${index}`;
            }
          }
          return {
            token_address: addr,
            token_type: parseInt(token.token_type?.toString() || '0'),
            name,
            symbol,
            created_at: token.created_at?.toString() || Date.now().toString()
          };
        });
        setTokens(parsedTokens);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { tokens, loading, error };
} 