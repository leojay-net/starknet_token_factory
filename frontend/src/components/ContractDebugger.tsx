'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useUserTokens } from '@/hooks/useUserTokens'
import { getTokenFactoryContract } from '@/lib/starknet'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

type DebugResult = {
    type: string
    value: unknown
}

export function ContractDebugger() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<DebugResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const { address } = useWallet()
    const { userTokens, refresh: refreshUserTokens } = useUserTokens()

    const testTotalTokens = async () => {
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            console.log('Testing get_total_tokens_created...')
            const contract = getTokenFactoryContract()
            const total = await contract.call('get_total_tokens_created', [])
            console.log('Total tokens result:', total)
            setResult({ type: 'total_tokens', value: total })
        } catch (err) {
            console.error('Error:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const testUserTokens = async () => {
        if (!address) {
            setError('No wallet connected')
            return
        }

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            console.log('Testing user tokens refresh for address:', address)
            await refreshUserTokens()
            console.log('User tokens result:', userTokens)
            setResult({ type: 'user_tokens', value: userTokens })
        } catch (err) {
            console.error('Error:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const testUserTokenCount = async () => {
        if (!address) {
            setError('No wallet connected')
            return
        }

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            console.log('Testing user token count for address:', address)
            const count = userTokens.length
            console.log('User token count result:', count)
            setResult({ type: 'user_token_count', value: count })
        } catch (err) {
            console.error('Error:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto mb-8">
            <CardHeader>
                <CardTitle>Contract Debug Panel</CardTitle>
                <CardDescription>
                    Test contract interactions to debug issues
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={testTotalTokens}
                        disabled={loading}
                        variant="outline"
                    >
                        Test Total Tokens
                    </Button>
                    <Button
                        onClick={testUserTokens}
                        disabled={loading || !address}
                        variant="outline"
                    >
                        Test User Tokens
                    </Button>
                    <Button
                        onClick={testUserTokenCount}
                        disabled={loading || !address}
                        variant="outline"
                    >
                        Test User Count
                    </Button>
                </div>

                {loading && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-blue-700">Loading...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-700 font-medium">Error:</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-700 font-medium">Result ({result.type}):</p>
                        <pre className="text-green-600 text-sm mt-1 whitespace-pre-wrap">
                            {JSON.stringify(result.value, null, 2)}
                        </pre>
                    </div>
                )}

                {address && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-gray-700 font-medium">Connected Address:</p>
                        <p className="text-gray-600 text-sm mt-1 font-mono">{address}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
