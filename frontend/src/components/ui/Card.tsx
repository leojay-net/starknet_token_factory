'use client'

import * as React from 'react'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`card-web3 ${className || ''}`}
            {...props}
        />
    )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props} />
    )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <h3
            className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}
            {...props}
        />
    )
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <p className={`text-sm text-[var(--stark-gray)] ${className || ''}`} {...props} />
    )
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`p-6 pt-0 ${className || ''}`} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`flex items-center p-6 pt-0 ${className || ''}`} {...props} />
    )
}
