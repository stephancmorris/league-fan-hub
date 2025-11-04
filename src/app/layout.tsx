import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { AuthSync } from '@/components/auth/AuthSync'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NRL Fan Hub - Live Scores & Predictions',
  description:
    'Engage with NRL matches in real-time. Make predictions, compete on leaderboards, and connect with fans.',
  keywords: ['NRL', 'Rugby League', 'Live Scores', 'Predictions', 'Fan Hub'],
  authors: [{ name: 'NRL Fan Hub Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'NRL Fan Hub',
    description: 'Live NRL scores and fan predictions',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B8246', // NRL official brand green
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <AuthSync />
          <InstallPrompt />
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
