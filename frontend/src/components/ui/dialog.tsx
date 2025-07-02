'use client'

import * as React from 'react'

export interface DialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}

export interface DialogContentProps {
    children: React.ReactNode
    className?: string
}

export interface DialogHeaderProps {
    children: React.ReactNode
    className?: string
}

export interface DialogTitleProps {
    children: React.ReactNode
    className?: string
}

export interface DialogDescriptionProps {
    children: React.ReactNode
    className?: string
}

const DialogContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
}>({
    open: false,
    onOpenChange: () => { }
})

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
    return (
        <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => { }) }}>
            {children}
        </DialogContext.Provider>
    )
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
    const { onOpenChange } = React.useContext(DialogContext)

    return (
        <div onClick={() => onOpenChange(true)}>
            {children}
        </div>
    )
}

export function DialogContent({ children, className }: DialogContentProps) {
    const { open, onOpenChange } = React.useContext(DialogContext)

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal */}
            <div className={`
        relative bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4
        border border-slate-200 dark:border-slate-700 z-50
        ${className || ''}
      `}>
                {children}
            </div>
        </div>
    )
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
    return (
        <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}>
            {children}
        </div>
    )
}

export function DialogTitle({ children, className }: DialogTitleProps) {
    return (
        <h3 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}>
            {children}
        </h3>
    )
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
    return (
        <p className={`text-sm text-slate-500 dark:text-slate-400 ${className || ''}`}>
            {children}
        </p>
    )
}
