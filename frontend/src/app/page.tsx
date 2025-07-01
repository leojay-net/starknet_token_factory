'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Code, Zap, Shield, BarChart3, Users, Rocket, Globe, TrendingUp, Layers, Sparkles, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EnhancedHero } from '@/components/sections/EnhancedHero'
import { GlowingOrb, FloatingParticle } from '@/components/ui/Effects'

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Code className="w-7 h-7" />,
      title: "AI-Powered Creation",
      description: "Deploy sophisticated tokens with our AI assistant that handles complex tokenomics, governance, and security features automatically.",
      gradient: "from-primary-500 to-secondary-500",
      delay: 0.1
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Sub-30s Deployment",
      description: "Lightning-fast deployment pipeline with optimized smart contracts that ensure minimal gas costs and maximum efficiency.",
      gradient: "from-accent-500 to-primary-500",
      delay: 0.2
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Fort Knox Security",
      description: "Multi-layered security with formal verification, automated audits, and battle-tested OpenZeppelin foundations.",
      gradient: "from-secondary-500 to-accent-500",
      delay: 0.3
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "Quantum Analytics",
      description: "Real-time analytics powered by machine learning with predictive insights and automated trading recommendations.",
      gradient: "from-primary-600 to-secondary-600",
      delay: 0.4
    },
    {
      icon: <Globe className="w-7 h-7" />,
      title: "Omnichain Infrastructure",
      description: "Built for tomorrow's multi-chain world with automatic bridge deployment and cross-chain liquidity management.",
      gradient: "from-accent-600 to-primary-600",
      delay: 0.5
    },
    {
      icon: <Rocket className="w-7 h-7" />,
      title: "Launch Ecosystem",
      description: "Complete IDO platform with KYC, marketing automation, community building tools, and institutional partnerships.",
      gradient: "from-secondary-600 to-accent-600",
      delay: 0.6
    }
  ]

  const stats = [
    {
      number: "50K+",
      label: "Tokens Deployed",
      icon: <Rocket className="w-6 h-6" />,
      description: "Across 12 networks"
    },
    {
      number: "$2.3B+",
      label: "Total Value Locked",
      icon: <TrendingUp className="w-6 h-6" />,
      description: "In ecosystem protocols"
    },
    {
      number: "150K+",
      label: "Active Creators",
      icon: <Users className="w-6 h-6" />,
      description: "Building the future"
    },
    {
      number: "99.99%",
      label: "Uptime SLA",
      icon: <Shield className="w-6 h-6" />,
      description: "Enterprise reliability"
    }
  ]

  const processSteps = [
    {
      step: "01",
      title: "Connect & Authenticate",
      description: "Secure wallet connection with biometric authentication, multi-sig support, and institutional-grade security protocols.",
      icon: <Shield className="w-8 h-8" />,
      color: "from-primary-600 to-secondary-600"
    },
    {
      step: "02",
      title: "AI-Powered Design",
      description: "Our AI analyzes your requirements and generates optimized tokenomics, governance structures, and utility mechanisms.",
      icon: <Sparkles className="w-8 h-8" />,
      color: "from-secondary-600 to-accent-600"
    },
    {
      step: "03",
      title: "Deploy & Scale",
      description: "One-click deployment with automatic verification, cross-chain bridges, and comprehensive growth analytics dashboard.",
      icon: <Rocket className="w-8 h-8" />,
      color: "from-accent-600 to-primary-600"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 relative overflow-hidden">
      {/* Enhanced Hero Section */}
      <EnhancedHero />

      {/* Stats Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20">
            <GlowingOrb size="md" color="primary" intensity="medium" />
          </div>
          <div className="absolute bottom-20 left-20">
            <GlowingOrb size="lg" color="secondary" intensity="high" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group"
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-glow h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center text-primary-400">
                      {stat.icon}
                    </div>
                    <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-gray-300 mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stat.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/20 to-secondary-950/20 backdrop-blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20 md:mb-32"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8"
              variants={itemVariants}
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-white font-medium">Enterprise Features</span>
            </motion.div>

            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8"
              variants={itemVariants}
            >
              Why Industry Leaders{' '}
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Choose Us
              </span>
            </motion.h2>
            <motion.p
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Experience the most advanced token creation platform with AI-powered features
              and institutional-grade infrastructure.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group"
                variants={itemVariants}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                custom={feature.delay}
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/10 hover:border-white/20 transition-all duration-500 h-full hover:shadow-glow relative overflow-hidden">
                  {/* Background gradient effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  <div className="relative z-10 text-center">
                    <div className={`w-16 h-16 md:w-18 md:h-18 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 group-hover:text-primary-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0">
          <div className="absolute top-32 left-1/4">
            <GlowingOrb size="xl" color="accent" intensity="low" />
          </div>
          <div className="absolute bottom-32 right-1/4">
            <GlowingOrb size="lg" color="primary" intensity="medium" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20 md:mb-32"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8"
              variants={itemVariants}
            >
              Launch in{' '}
              <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </motion.h2>
            <motion.p
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              From concept to live token in under 3 minutes. Experience the fastest deployment pipeline in Web3.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {processSteps.map((item, index) => (
              <motion.div
                key={index}
                className="group relative"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-glow h-full">
                  <div className="text-center">
                    <div className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br ${item.color} rounded-3xl flex flex-col items-center justify-center mx-auto mb-8 shadow-glow group-hover:shadow-glow-lg transition-all duration-300`}>
                      <div className="text-white mb-1">
                        {item.icon}
                      </div>
                      <span className="text-white text-sm font-bold">{item.step}</span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-6 group-hover:text-primary-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent z-0"></div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-[3rem] p-10 md:p-16 border border-white/20 shadow-glow relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent-500/10"></div>

            <div className="relative z-10">
              <motion.div
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8"
                variants={itemVariants}
              >
                <CheckCircle className="w-4 h-4 text-accent-400" />
                <span className="text-white font-medium">Trusted by 150K+ Creators</span>
              </motion.div>

              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8"
                variants={itemVariants}
              >
                Ready to{' '}
                <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                  Revolutionize
                </span>
                <br />
                Web3?
              </motion.h2>
              <motion.p
                className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto"
                variants={itemVariants}
              >
                Join the next generation of token creators building the future of decentralized finance.
                Start your journey today.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                variants={itemVariants}
              >
                <Link href="/create">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white border-0 shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center space-x-3 px-12 py-6 text-xl font-semibold"
                    >
                      <Rocket className="w-6 h-6" />
                      <span>Create Your First Token</span>
                      <ArrowRight className="w-6 h-6" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/5 border-white/30 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all duration-300 px-12 py-6 text-xl font-semibold"
                    >
                      View Dashboard
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
