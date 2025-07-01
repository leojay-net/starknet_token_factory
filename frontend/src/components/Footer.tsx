import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Github, Twitter, MessageCircle, Mail, ExternalLink, Heart } from 'lucide-react'

interface FooterLink {
    name: string;
    href: string;
    external?: boolean;
}

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()

    const footerLinks: Record<string, FooterLink[]> = {
        product: [
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Create Token', href: '/create' },
            { name: 'Explorer', href: '/explorer' },
            { name: 'Analytics', href: '/analytics' },
        ],
        developers: [
            { name: 'Documentation', href: '/docs', external: true },
            { name: 'API Reference', href: '/api', external: true },
            { name: 'GitHub', href: 'https://github.com', external: true },
            { name: 'Smart Contracts', href: '/contracts', external: true },
        ],
        community: [
            { name: 'Discord', href: 'https://discord.gg', external: true },
            { name: 'Twitter', href: 'https://twitter.com', external: true },
            { name: 'Blog', href: '/blog' },
            { name: 'Help Center', href: '/help' },
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Contact', href: '/contact' },
        ]
    }

    const socialLinks = [
        {
            name: 'Twitter',
            href: 'https://twitter.com',
            icon: <Twitter className="w-5 h-5" />,
            gradient: 'from-blue-400 to-blue-600'
        },
        {
            name: 'GitHub',
            href: 'https://github.com',
            icon: <Github className="w-5 h-5" />,
            gradient: 'from-gray-400 to-gray-600'
        },
        {
            name: 'Discord',
            href: 'https://discord.gg',
            icon: <MessageCircle className="w-5 h-5" />,
            gradient: 'from-purple-400 to-purple-600'
        },
        {
            name: 'Email',
            href: 'mailto:hello@tokenfactory.io',
            icon: <Mail className="w-5 h-5" />,
            gradient: 'from-primary-400 to-secondary-400'
        },
    ]

    return (
        <footer className="bg-dark-900/50 backdrop-blur-xl border-t border-white/10 mt-auto relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950/50 to-transparent"></div>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-accent-500/5 to-primary-500/5 rounded-full blur-3xl"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <motion.div
                            className="flex items-center mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4 shadow-glow">
                                <Zap className="text-white font-bold text-lg w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Token Factory
                            </span>
                        </motion.div>
                        <motion.p
                            className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                        >
                            The future of token creation. Deploy sophisticated ERC20 and ERC721 tokens on Starknet
                            with enterprise-grade tools and zero coding required.
                        </motion.p>

                        {/* Social Links */}
                        <motion.div
                            className="flex space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-12 h-12 bg-gradient-to-br ${social.gradient} rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-glow hover:shadow-glow-lg`}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {social.icon}
                                    <span className="sr-only">{social.name}</span>
                                </motion.a>
                            ))}
                        </motion.div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
                                <motion.div
                                    key={category}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <h3 className="text-white font-semibold text-lg mb-6 capitalize">
                                        {category}
                                    </h3>
                                    <ul className="space-y-4">
                                        {links.map((link, index) => (
                                            <li key={link.name}>
                                                {link.external ? (
                                                    <a
                                                        href={link.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                                                    >
                                                        <span>{link.name}</span>
                                                        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                ) : (
                                                    <Link
                                                        href={link.href}
                                                        className="text-gray-400 hover:text-white transition-colors duration-300"
                                                    >
                                                        {link.name}
                                                    </Link>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <motion.div
                    className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-400 text-sm">
                        <p>© {currentYear} Token Factory. All rights reserved.</p>
                        <div className="flex items-center space-x-1">
                            <span>Built with</span>
                            <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                            <span>for the Web3 community</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <span className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                            <span>All systems operational</span>
                        </span>
                        <Link href="/status" className="hover:text-white transition-colors">
                            Status
                        </Link>
                    </div>
                </motion.div>
            </div>
        </footer>
    )
}

export default Footer
