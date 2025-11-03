import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NRL Fan Hub - Live Scores & Predictions',
  description: 'Engage with NRL matches in real-time. Make predictions, compete on leaderboards, and connect with fans.',
  keywords: ['NRL', 'Rugby League', 'Live Scores', 'Predictions', 'Fan Hub'],
  authors: [{ name: 'NRL Fan Hub Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1e3a8a',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
