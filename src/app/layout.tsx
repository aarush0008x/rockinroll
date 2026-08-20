import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { Navbar } from '@/components/Navbar'
import { CartDrawer } from '@/components/CartDrawer'
import { Footer } from '@/components/Footer'
import { PWAPrompt } from '@/components/PWAPrompt'

export const metadata: Metadata = {
  title: 'RockinRoll — Gourmet Kathi & Fusion Rolls',
  description: 'Order authentic smoky Kathi rolls, truffle paneer wraps, and fiery fusion bowls. Fast midnight delivery.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FFF8F5] text-[#1A1A1A]">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <PWAPrompt />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
