'use client'

import Link from 'next/link'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/Button'
import { Wallet, Menu } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
    const { account, address, isConnected, connect, disconnect, isLoading } = useWallet()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    return (
        <nav className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            Token Factory
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/create"
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Create Token
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/explorer"
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Explorer
                        </Link>
                    </div>

                    {/* Wallet Connection */}
                    <div className="flex items-center space-x-4">
                        {isConnected && address ? (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:block">
                                    {formatAddress(address)}
                                </span>
                                <Button
                                    onClick={() => disconnect()}
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading}
                                >
                                    Disconnect
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => connect()}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                disabled={isLoading}
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                {isLoading ? 'Connecting...' : 'Connect Wallet'}
                            </Button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/create"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Create Token
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/explorer"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Explorer
                            </Link>
                        </div>
                    </div>
                )}
            </div>

        </nav>
    )
}
