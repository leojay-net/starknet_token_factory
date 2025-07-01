import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from '@/context/WalletContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: "Token Factory - Next-Gen Web3 Token Creation Platform",
  description: "Deploy sophisticated ERC20 and ERC721 tokens on Starknet with enterprise-grade tools. No code required. Built for the future of Web3.",
  keywords: "Starknet, tokens, ERC20, ERC721, Web3, DeFi, blockchain, no-code, token factory",
  authors: [{ name: "Token Factory Team" }],
  openGraph: {
    title: "Token Factory - Next-Gen Web3 Token Creation Platform",
    description: "Deploy sophisticated ERC20 and ERC721 tokens on Starknet with enterprise-grade tools.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Token Factory - Next-Gen Web3 Token Creation Platform",
    description: "Deploy sophisticated ERC20 and ERC721 tokens on Starknet with enterprise-grade tools.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0ea5e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-dark-950 antialiased text-white overflow-x-hidden">
        <WalletProvider>
          <div className="flex flex-col min-h-screen relative">
            <Navbar />
            <main className="flex-1 relative">
              {children}
            </main>
            <Footer />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
