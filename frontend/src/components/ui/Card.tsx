import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
    children: React.ReactNode
    className?: string
    padding?: 'sm' | 'md' | 'lg'
}

const Card: React.FC<CardProps> = ({ children, className, padding = 'md' }) => {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    }

    return (
        <div className={cn(
            'bg-white rounded-lg shadow-md border border-gray-200',
            paddingClasses[padding],
            className
        )}>
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: React.ReactNode
    className?: string
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    )
}

interface CardTitleProps {
    children: React.ReactNode
    className?: string
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
    return (
        <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
            {children}
        </h3>
    )
}

interface CardContentProps {
    children: React.ReactNode
    className?: string
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
    return (
        <div className={cn(className)}>
            {children}
        </div>
    )
}

export { Card, CardHeader, CardTitle, CardContent }
