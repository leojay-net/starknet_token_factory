import React from 'react'
import { motion } from 'framer-motion'

interface GlowingOrbProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    color?: 'primary' | 'secondary' | 'accent'
    intensity?: 'low' | 'medium' | 'high'
    animate?: boolean
    className?: string
}

export const GlowingOrb: React.FC<GlowingOrbProps> = ({
    size = 'md',
    color = 'primary',
    intensity = 'medium',
    animate = true,
    className = ''
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-16 h-16',
        xl: 'w-32 h-32'
    }

    const colors = {
        primary: 'bg-gradient-to-r from-primary-400 to-primary-600',
        secondary: 'bg-gradient-to-r from-secondary-400 to-secondary-600',
        accent: 'bg-gradient-to-r from-accent-400 to-accent-600'
    }

    const glows = {
        low: 'shadow-lg',
        medium: 'shadow-glow',
        high: 'shadow-glow-lg'
    }

    const orbComponent = (
        <div
            className={`
        ${sizes[size]} 
        ${colors[color]} 
        ${glows[intensity]}
        rounded-full 
        blur-sm 
        opacity-80
        ${className}
      `}
        />
    )

    if (!animate) return orbComponent

    return (
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {orbComponent}
        </motion.div>
    )
}

interface FloatingParticleProps {
    delay?: number
    duration?: number
    className?: string
}

export const FloatingParticle: React.FC<FloatingParticleProps> = ({
    delay = 0,
    duration = 20,
    className = ''
}) => {
    return (
        <motion.div
            className={`absolute w-1 h-1 bg-white/20 rounded-full ${className}`}
            animate={{
                y: [-20, -100],
                x: [0, Math.random() * 50 - 25],
                opacity: [0, 1, 0],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    )
}

interface AnimatedGridProps {
    rows?: number
    cols?: number
    className?: string
}

export const AnimatedGrid: React.FC<AnimatedGridProps> = ({
    rows = 10,
    cols = 10,
    className = ''
}) => {
    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <div
                className="grid gap-1 opacity-10"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    height: '100%',
                    width: '100%'
                }}
            >
                {Array.from({ length: rows * cols }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="bg-white/10 rounded-sm"
                        animate={{
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                            duration: 2,
                            delay: (i * 0.1) % 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
