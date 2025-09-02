import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Navbar from "@/components/navbar"
import SnipcartProvider from '@/components/snipcart-provider'
import { Toaster } from '@/components/ui/toaster'
import { FavoritesProvider } from '@/components/favorites-provider'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <FavoritesProvider>
          <Navbar />
          {children}
          <SnipcartProvider />
          <Toaster />
        </FavoritesProvider>
      </body>
    </html>
  )
}
