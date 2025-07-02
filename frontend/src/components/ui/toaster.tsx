'use client'

import * as React from "react"

const toastVariants = {
    default: "bg-background text-foreground",
    destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
}

export interface Toast {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: keyof typeof toastVariants
}

const ToastContext = React.createContext<{
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}>({
    toasts: [],
    addToast: () => { },
    removeToast: () => { },
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { ...toast, id }])

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 5000)
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export function Toaster() {
    const { toasts, removeToast } = useToast()

    return (
        <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:bottom-0 sm:right-0 sm:flex-col md:max-w-[420px]">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${toast.variant === 'destructive'
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-200 bg-white text-gray-900'
                        }`}
                >
                    <div className="grid gap-1">
                        {toast.title && (
                            <div className="text-sm font-semibold">{toast.title}</div>
                        )}
                        {toast.description && (
                            <div className="text-sm opacity-90">{toast.description}</div>
                        )}
                    </div>
                    <button
                        className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100"
                        onClick={() => removeToast(toast.id)}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    )
}
