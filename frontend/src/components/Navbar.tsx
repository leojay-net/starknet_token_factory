'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Wallet, LogOut, Menu, X, Zap, Globe } from 'lucide-react'
import { useWallet } from '@/context/WalletContext'
import { formatAddress } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { useState } from 'react'

const Navbar: React.FC = () => {
    const pathname = usePathname()
    const { address, isConnected, isLoading, connect, disconnect } = useWallet()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Create Token', href: '/create' },
        { name: 'Explorer', href: '/explorer' },
    ]

    const isActive = (href: string) => {
        if (href === '/' && pathname !== '/') return false
        return pathname.startsWith(href)
    }

    return (
        <motion.nav
            className="bg-dark-900/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 md:h-20">
                    {/* Logo and Desktop Navigation */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center group">
                            <motion.div
                                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-3 shadow-glow group-hover:shadow-glow-lg transition-all duration-300"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Zap className="text-white font-bold text-lg w-6 h-6" />
                            </motion.div>
                            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-primary-400 group-hover:to-secondary-400 transition-all duration-300">
                                Token Factory
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:ml-10 md:flex md:space-x-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(item.href)
                                            ? 'text-primary-400 bg-white/10'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {item.name}
                                    {isActive(item.href) && (
                                        <motion.div
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
                                            layoutId="activeTab"
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Wallet Connection */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {isLoading ? (
                            <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-400"></div>
                                <span className="text-sm text-gray-300">Connecting...</span>
                            </div>
                        ) : isConnected ? (
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-white/10 backdrop-blur-sm">
                                    <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                                    <Wallet className="w-4 h-4 text-primary-400" />
                                    <span className="text-sm font-mono text-white">
                                        {formatAddress(address || '')}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={disconnect}
                                    className="bg-white/5 border-white/20 text-white hover:bg-red-500/20 hover:border-red-400/30 hover:text-red-300 transition-all duration-300 flex items-center space-x-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Disconnect</span>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={connect}
                                className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white border-0 shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center space-x-2 px-6"
                            >
                                <Wallet className="w-4 h-4" />
                                <span>Connect Wallet</span>
                            </Button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <motion.button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                            whileTap={{ scale: 0.95 }}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <motion.div
                        className="md:hidden absolute left-0 right-0 bg-dark-900/98 backdrop-blur-xl z-50 border-b border-white/10"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-4 pt-4 pb-3 space-y-2">
                            {navigation.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${isActive(item.href)
                                                ? 'text-primary-400 bg-white/10'
                                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                                            }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Mobile Wallet Connection */}
                        <div className="pt-4 pb-6 border-t border-white/10">
                            <div className="px-4 space-y-3">
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-400"></div>
                                        <span className="text-sm text-gray-300">Connecting...</span>
                                    </div>
                                ) : isConnected ? (
                                    <>
                                        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-white/10">
                                            <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                                            <Wallet className="w-4 h-4 text-primary-400" />
                                            <span className="text-sm font-mono text-white">
                                                {formatAddress(address || '')}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={disconnect}
                                            className="w-full bg-white/5 border-white/20 text-white hover:bg-red-500/20 hover:border-red-400/30 hover:text-red-300 transition-all duration-300 flex items-center justify-center space-x-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Disconnect</span>
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={connect}
                                        className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white border-0 shadow-glow transition-all duration-300 flex items-center justify-center space-x-2"
                                    >
                                        <Wallet className="w-4 h-4" />
                                        <span>Connect Wallet</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    )
}

export default Navbar
