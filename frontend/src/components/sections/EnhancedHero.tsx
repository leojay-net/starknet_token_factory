import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Rocket, Zap, Globe, Layers } from 'lucide-react'
import Button from '@/components/ui/Button'
import { GlowingOrb, FloatingParticle } from '@/components/ui/Effects'

export const EnhancedHero: React.FC = () => {
    const floatingElements = Array.from({ length: 20 }, (_, i) => (
        <FloatingParticle
            key={i}
            delay={i * 0.5}
            duration={15 + Math.random() * 10}
            className={`left-${Math.random() * 100}%`}
        />
    ))

    const features = [
        { icon: <Zap className="w-5 h-5" />, text: "Instant Deploy" },
        { icon: <Globe className="w-5 h-5" />, text: "Cross-Chain Ready" },
        { icon: <Layers className="w-5 h-5" />, text: "Enterprise Grade" }
    ]

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800" />

                {/* Floating Orbs */}
                <div className="absolute top-20 left-20">
                    <GlowingOrb size="lg" color="primary" intensity="high" />
                </div>
                <div className="absolute top-40 right-32">
                    <GlowingOrb size="md" color="secondary" intensity="medium" />
                </div>
                <div className="absolute bottom-32 left-1/4">
                    <GlowingOrb size="xl" color="accent" intensity="low" />
                </div>
                <div className="absolute bottom-20 right-20">
                    <GlowingOrb size="md" color="primary" intensity="medium" />
                </div>

                {/* Floating Particles */}
                {floatingElements}

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Badge */}
                    <motion.div
                        className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        <span className="text-white font-medium">The Future of Token Creation</span>
                        <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Deploy{' '}
                        <span className="relative">
                            <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent animate-gradient-x">
                                Next-Gen
                            </span>
                            <motion.div
                                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 1, delay: 1 }}
                            />
                        </span>
                        <br />
                        Tokens
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <span className="text-primary-400 font-semibold">No Code.</span>{' '}
                        <span className="text-secondary-400 font-semibold">No Limits.</span>{' '}
                        <span className="text-accent-400 font-semibold">Just Innovation.</span>
                    </motion.p>

                    {/* Description */}
                    <motion.p
                        className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        Create sophisticated ERC20 and ERC721 tokens on Starknet with enterprise-grade tools.
                        From concept to deployment in under 60 seconds.
                    </motion.p>

                    {/* Feature Pills */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-4 mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.text}
                                className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2"
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-primary-400">{feature.icon}</div>
                                <span className="text-white text-sm font-medium">{feature.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                    >
                        <Link href="/create">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white border-0 shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center space-x-3 px-10 py-5 text-xl font-semibold"
                                >
                                    <Rocket className="w-6 h-6" />
                                    <span>Launch Your Token</span>
                                    <ArrowRight className="w-6 h-6" />
                                </Button>
                            </motion.div>
                        </Link>

                        <Link href="/explorer">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="bg-white/5 border-white/30 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all duration-300 px-10 py-5 text-xl font-semibold"
                                >
                                    Explore Ecosystem
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>

                    {/* Stats Preview */}
                    <motion.div
                        className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                    >
                        {[
                            { value: "50K+", label: "Tokens Created" },
                            { value: "$2.3B+", label: "Total Value" },
                            { value: "150K+", label: "Active Users" }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-400 text-sm font-medium">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <motion.div
                        className="w-1 h-3 bg-white rounded-full mt-2"
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </section>
    )
}
