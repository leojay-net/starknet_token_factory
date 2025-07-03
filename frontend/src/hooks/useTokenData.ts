import { useEffect, useState } from 'react';
import { getTokenFactoryContract, getERC20Contract, getERC721Contract } from '@/lib/starknet';
import { ERC20TokenData, ERC721TokenData, NFTMetadata } from '@/types';

type TokenData = ERC20TokenData | ERC721TokenData;

export function useTokenData(tokenAddress: string) {
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tokenAddress) {
            setLoading(false);
            return;
        }

        const fetchTokenData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Fetching token data for:', tokenAddress);

                // Ensure token address is in hex format
                let hexTokenAddress = tokenAddress;
                if (!tokenAddress.startsWith('0x')) {
                    // Convert decimal to hex if needed
                    hexTokenAddress = '0x' + BigInt(tokenAddress).toString(16);
                }

                console.log('Using hex token address:', hexTokenAddress);

                // First, check if this token was created by our factory
                const factoryContract = getTokenFactoryContract();

                console.log('Checking if token was created by factory...');
                let isFactoryToken;
                try {
                    isFactoryToken = await factoryContract.call('is_token_created_by_factory', [hexTokenAddress]);
                    console.log('Factory check result:', isFactoryToken);
                } catch (factoryError) {
                    console.warn('Factory check failed, continuing anyway:', factoryError);
                    isFactoryToken = true; // Continue anyway if factory check fails
                }

                if (!isFactoryToken) {
                    throw new Error('Token not found or not created by this factory');
                }

                // Try to determine token type by calling ERC20 methods first
                let tokenData: TokenData;

                try {
                    // Try ERC20 methods
                    const erc20Contract = getERC20Contract(hexTokenAddress);
                    const [nameResult, symbolResult, decimalsResult, totalSupplyResult] = await Promise.all([
                        erc20Contract.call('name', []),
                        erc20Contract.call('symbol', []),
                        erc20Contract.call('decimals', []),
                        erc20Contract.call('total_supply', [])
                    ]);

                    // Parse ByteArray name and symbol
                    const name = parseByteArray(nameResult);
                    const symbol = parseByteArray(symbolResult);
                    const decimals = parseInt(decimalsResult.toString());
                    const totalSupply = BigInt(totalSupplyResult.toString());

                    tokenData = {
                        address: hexTokenAddress,
                        type: 'ERC20',
                        name,
                        symbol,
                        decimals,
                        totalSupply
                    } as ERC20TokenData;

                    console.log('ERC20 token data:', tokenData);

                } catch (erc20Error) {
                    console.log('Not an ERC20 token, trying ERC721...', erc20Error);

                    try {
                        // Try ERC721 methods
                        const erc721Contract = getERC721Contract(hexTokenAddress);
                        const [nameResult, symbolResult] = await Promise.all([
                            erc721Contract.call('name', []),
                            erc721Contract.call('symbol', [])
                        ]);

                        // Parse ByteArray name and symbol
                        const name = parseByteArray(nameResult);
                        const symbol = parseByteArray(symbolResult);

                        // Try to get base URI (optional)
                        let baseUri = '';
                        try {
                            const baseUriResult = await erc721Contract.call('base_uri', []);
                            baseUri = parseByteArray(baseUriResult);
                        } catch {
                            console.log('base_uri method not available');
                        }

                        // Try to get token URI for token ID 1 (first NFT)
                        let tokenUri = '';
                        let metadata: NFTMetadata | undefined;
                        
                        try {
                            // Try to get token URI for the first token (ID 1)
                            const tokenUriResult = await erc721Contract.call('token_uri', [{ low: 1n, high: 0n }]);
                            tokenUri = parseByteArray(tokenUriResult);
                            console.log('Token URI for token 1:', tokenUri);

                            // If we have a token URI, try to fetch metadata
                            if (tokenUri) {
                                try {
                                    const metadataResponse = await fetch(tokenUri);
                                    if (metadataResponse.ok) {
                                        metadata = await metadataResponse.json();
                                        console.log('Fetched metadata:', metadata);
                                    }
                                } catch (metadataError) {
                                    console.warn('Failed to fetch metadata from token URI:', metadataError);
                                }
                            }
                        } catch (tokenUriError) {
                            console.log('token_uri method not available or failed:', tokenUriError);
                        }

                        tokenData = {
                            address: hexTokenAddress,
                            type: 'ERC721',
                            name,
                            symbol,
                            baseUri,
                            tokenUri,
                            metadata
                        } as ERC721TokenData;

                        console.log('ERC721 token data:', tokenData);

                    } catch (erc721Error) {
                        console.error('Failed to fetch as ERC721:', erc721Error);
                        throw new Error('Token is neither ERC20 nor ERC721, or contract calls failed');
                    }
                }

                setTokenData(tokenData);

            } catch (err: any) {
                console.error('Error fetching token data:', err);
                setError(err.message || 'Failed to fetch token data');
            } finally {
                setLoading(false);
            }
        };

        fetchTokenData();
    }, [tokenAddress]);

    return { tokenData, loading, error };
}

// Helper function to parse ByteArray from contract response
function parseByteArray(result: any): string {
    try {
        // Handle different possible ByteArray formats
        if (typeof result === 'string') {
            // Simple string response
            return result;
        }

        if (result?.data?.[0]) {
            // ByteArray structure: { data: Array<bytes31>, pending_word: felt252, pending_word_len: u32 }
            const hexString = result.data[0].replace('0x', '');
            return Buffer.from(hexString, 'hex').toString('utf8').replace(/\0/g, '');
        }

        if (Array.isArray(result) && result.length > 0) {
            // Sometimes the response is just an array
            const hexString = result[0].replace('0x', '');
            return Buffer.from(hexString, 'hex').toString('utf8').replace(/\0/g, '');
        }

        return 'Unknown';
    } catch (e) {
        console.warn('Error parsing ByteArray:', e, result);
        return 'Unknown';
    }
} 