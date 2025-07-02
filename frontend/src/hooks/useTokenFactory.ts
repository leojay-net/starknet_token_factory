import { useWallet } from '@/contexts/WalletContext'
import { getTokenFactoryContract, bigIntToU256, encodeByteArrayWithCallData } from '@/lib/starknet'
import { Account } from 'starknet'

export function useTokenFactory() {
    const { account } = useWallet()

    const createERC20 = async (
        name: string,
        symbol: string,
        decimals: number,
        initialSupply: string
    ) => {
        if (!account) {
            throw new Error('Wallet not connected')
        }

        const contract = getTokenFactoryContract(account as Account)
        const initialSupplyU256 = bigIntToU256(BigInt(initialSupply) * BigInt(10 ** decimals))

        console.log('🏭 useTokenFactory: Creating ERC20 with params:', {
            name,
            symbol,
            decimals,
            initialSupply,
            initialSupplyU256,
            encodedName: encodeByteArrayWithCallData(name),
            encodedSymbol: encodeByteArrayWithCallData(symbol)
        })

        return await contract.create_erc20(
            encodeByteArrayWithCallData(name),
            encodeByteArrayWithCallData(symbol),
            decimals,
            initialSupplyU256
        )
    }

    const createERC721 = async (
        name: string,
        symbol: string,
        baseUri: string
    ) => {
        if (!account) {
            throw new Error('Wallet not connected')
        }

        const contract = getTokenFactoryContract(account as Account)

        console.log('🏭 useTokenFactory: Creating ERC721 with params:', {
            name,
            symbol,
            baseUri,
            encodedName: encodeByteArrayWithCallData(name),
            encodedSymbol: encodeByteArrayWithCallData(symbol),
            encodedBaseUri: encodeByteArrayWithCallData(baseUri)
        })

        return await contract.create_erc721(
            encodeByteArrayWithCallData(name),
            encodeByteArrayWithCallData(symbol),
            encodeByteArrayWithCallData(baseUri)
        )
    }

    return {
        createERC20,
        createERC721
    }
} 