'use client'

import { WalletProvider } from '@/contexts/WalletContext'
import { Navbar } from '@/components/Navbar'
import { Toaster, ToastProvider } from '@/components/ui/toaster'
import { Toaster as HotToaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WalletProvider>
            <ToastProvider>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
                <Toaster />
                <HotToaster position="top-right" />
            </ToastProvider>
        </WalletProvider>
    )
}
