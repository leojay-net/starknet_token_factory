'use client'

import React from 'react'
import { StarknetConfig } from '@starknet-react/core'
import { sepolia, mainnet } from '@starknet-react/chains'
import { InjectedConnector } from '@starknet-react/core'
import { RpcProvider } from 'starknet'

const chains = [sepolia, mainnet]

// Create connectors using InjectedConnector
const connectors = [
    new InjectedConnector({ options: { id: 'argentX' } }),
    new InjectedConnector({ options: { id: 'braavos' } }),
]

function provider(chain: any) {
    return new RpcProvider({
        nodeUrl: chain.rpcUrls?.default?.http?.[0] || 'https://starknet-sepolia.public.blastapi.io'
    })
}

export function StarknetProvider({ children }: { children: React.ReactNode }) {
    return (
        <StarknetConfig
            chains={chains}
            provider={provider}
            connectors={connectors}
            
        >
            {children}
        </StarknetConfig>
    )
}
