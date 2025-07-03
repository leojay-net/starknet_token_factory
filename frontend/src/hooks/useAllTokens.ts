import { useEffect, useState } from 'react';
import { fetchAllTokens } from '@/lib/starknet';

export function useAllTokens() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAllTokens()
      .then((result) => {
        let tokenArray: any[] = [];
        if (Array.isArray(result)) {
          tokenArray = result;
        }
        // Parse and map tokens
        const parsedTokens = tokenArray.map((token: any, index: number) => {
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
          } catch (e) {
            name = `Token ${index + 1}`;
            symbol = `TK${index + 1}`;
          }
          // Format address
          let addr = token.token_address || `0x${index}`;
          addr = String(addr);
          if (!addr.startsWith('0x') && addr !== `0x${index}`) {
            try {
              addr = '0x' + BigInt(addr).toString(16);
            } catch (e) {
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
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { tokens, loading, error };
} 