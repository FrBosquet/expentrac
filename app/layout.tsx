import { RootProvider } from '@components/Provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const montserrat = localFont({
  src: [
    { path: '../public/fonts/MontserratAlt1-SemiBold.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/MontserratAlt1-ExtraBold.woff2', weight: '800', style: 'normal' }
  ]
})
const inter = Inter({ subsets: ['latin'] })

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
      <body className={`${inter.className} ${montserrat.className} text-black`}>
        <RootProvider >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
