'use client'

import * as React from 'react'

export interface TabsProps {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    className?: string
}

export interface TabsListProps {
    children: React.ReactNode
    className?: string
}

export interface TabsTriggerProps {
    value: string
    children: React.ReactNode
    className?: string
}

export interface TabsContentProps {
    value: string
    children: React.ReactNode
    className?: string
}

const TabsContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
}>({
    value: '',
    onValueChange: () => { }
})

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '')

    const currentValue = value !== undefined ? value : internalValue
    const handleValueChange = onValueChange || setInternalValue

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={className}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            className={`
        inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500
        dark:bg-slate-800 dark:text-slate-400 ${className || ''}
      `}
        >
            {children}
        </div>
    )
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
    const { value: currentValue, onValueChange } = React.useContext(TabsContext)
    const isActive = currentValue === value

    return (
        <button
            className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm
        font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none
        disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300
        ${isActive
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50'
                    : 'hover:bg-white/50 dark:hover:bg-slate-950/50'
                }
        ${className || ''}
      `}
            onClick={() => onValueChange(value)}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const { value: currentValue } = React.useContext(TabsContext)

    if (currentValue !== value) return null

    return (
        <div
            className={`
        mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950
        dark:focus-visible:ring-slate-300 ${className || ''}
      `}
        >
            {children}
        </div>
    )
}
