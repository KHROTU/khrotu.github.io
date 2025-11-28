import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KHROTU | Full Stack & AI/ML Developer',
  description: 'A Full Stack Developer and AI/ML enthusiast, turning complex problems into elegant software solutions.',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-900 text-gray-200`}>
        <Header />
        <main className="pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  )
}