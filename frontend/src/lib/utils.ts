import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatAddress(address: string, chars = 6): string {
    if (!address) return ""
    return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatNumber(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
}

export function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString()
}

export function formatDateTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString()
}
