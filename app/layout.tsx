import { RootProvider } from '@components/Provider'
import { DarkModeProvider } from '@components/darkmode'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const montserrat = localFont({
  src: [
    { path: '../public/fonts/MontserratAlt1-SemiBold.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/MontserratAlt1-ExtraBold.woff2', weight: '800', style: 'normal' }
  ],
  variable: '--font-montserrat'
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Expentrac',
  description: 'Track your recurrent expenses.',
  icons: '/favicon.ico'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-sans [view-timeline-name: fall]`}>
        <DarkModeProvider>
          <RootProvider >
            {children}
          </RootProvider>
        </DarkModeProvider>
      </body>
    </html>
  )
}
