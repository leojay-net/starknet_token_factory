'use client'

import Link from 'next/link'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/Button'
import { Wallet, Menu } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export function Navbar() {
    const { address, isConnected, connect, disconnect, isLoading } = useWallet()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname();

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    return (
        <nav className="glass border-b border-white/20 dark:border-white/10 sticky top-0 z-50 backdrop-blur-xl">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="h-10 w-10 bg-[var(--stark-orange)] rounded-xl flex items-center justify-center transform transition-transform group-hover:scale-105">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="transform transition-transform group-hover:rotate-12">
                                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                                </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--stark-purple)] rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-xl font-bold text-[var(--foreground)] hover:text-[var(--stark-orange)] transition-colors">
                            Token Factory
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {pathname !== '/' && (
                            <Link
                                href="/"
                                className="relative text-[var(--foreground)] hover:text-[var(--stark-orange)] transition-all duration-300 font-medium group"
                            >
                                Home
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--stark-orange)] transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        )}
                        <Link
                            href="/create"
                            className="relative text-[var(--foreground)] hover:text-[var(--stark-orange)] transition-all duration-300 font-medium group"
                        >
                            Create Token
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--stark-orange)] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            href="/dashboard"
                            className="relative text-[var(--foreground)] hover:text-[var(--stark-orange)] transition-all duration-300 font-medium group"
                        >
                            Dashboard
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--stark-orange)] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            href="/explorer"
                            className="relative text-[var(--foreground)] hover:text-[var(--stark-orange)] transition-all duration-300 font-medium group"
                        >
                            Explorer
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--stark-orange)] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </div>

                    {/* Wallet Connection */}
                    <div className="flex items-center space-x-4">
                        {isLoading ? (
                            <div className="flex items-center space-x-2 text-[var(--stark-gray)] text-sm">
                                <div className="w-4 h-4 border-2 border-[var(--stark-orange)] border-t-transparent rounded-full animate-spin"></div>
                                <span>Connecting...</span>
                            </div>
                        ) : isConnected && address ? (
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2 px-3 py-2 bg-[var(--stark-orange)]/10 rounded-xl border border-[var(--stark-orange)]/20">
                                    <div className="connection-indicator">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <span className="text-sm text-[var(--foreground)] font-mono hidden sm:block">
                                        {formatAddress(address)}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => disconnect()}
                                    variant="outline"
                                    size="sm"
                                    className="border-[var(--stark-orange)]/30 text-[var(--stark-orange)] hover:bg-[var(--stark-orange)] hover:text-white transition-all duration-300"
                                    disabled={isLoading}
                                >
                                    Disconnect
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => connect()}
                                className="bg-[var(--stark-orange)] hover:bg-[var(--stark-orange-dark)] text-white font-medium px-6 py-2 rounded-xl transform transition-all duration-300 hover:scale-105 hover-glow-orange"
                                disabled={isLoading}
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet
                            </Button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-[var(--foreground)] hover:text-[var(--stark-orange)] transition-colors rounded-lg hover:bg-[var(--stark-orange)]/10"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/20 dark:border-white/10 animate-slide-in-up">
                        <div className="flex flex-col space-y-4">
                            {pathname !== '/' && (
                                <Link
                                    href="/"
                                    className="text-[var(--foreground)] hover:text-[var(--stark-orange)] transition-colors font-medium px-2 py-1 rounded-lg hover:bg-[var(--stark-orange)]/10"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Home
                                </Link>
                            )}
                            <Link
                                href="/create"
                                className="text-[var(--foreground)] hover:text-[var(--stark-orange)] transition-colors font-medium px-2 py-1 rounded-lg hover:bg-[var(--stark-orange)]/10"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Create Token
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-[var(--foreground)] hover:text-[var(--stark-orange)] transition-colors font-medium px-2 py-1 rounded-lg hover:bg-[var(--stark-orange)]/10"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/explorer"
                                className="text-[var(--foreground)] hover:text-[var(--stark-orange)] transition-colors font-medium px-2 py-1 rounded-lg hover:bg-[var(--stark-orange)]/10"
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
