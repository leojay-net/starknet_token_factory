import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatNumber(num: number | string): string {
    const number = typeof num === 'string' ? parseFloat(num) : num
    if (number >= 1e9) {
        return (number / 1e9).toFixed(2) + 'B'
    } else if (number >= 1e6) {
        return (number / 1e6).toFixed(2) + 'M'
    } else if (number >= 1e3) {
        return (number / 1e3).toFixed(2) + 'K'
    }
    return number.toLocaleString()
}

export function formatTokenAmount(amount: string | number, decimals: number = 18): string {
    const value = typeof amount === 'string' ? BigInt(amount) : BigInt(amount.toString())
    const divisor = BigInt(10 ** decimals)
    const whole = value / divisor
    const remainder = value % divisor

    if (remainder === BigInt(0)) {
        return whole.toString()
    }

    const decimal = remainder.toString().padStart(decimals, '0').replace(/0+$/, '')
    return `${whole}.${decimal}`
}
