import { Provider } from '@components/Provider'
import type { Metadata } from 'next'
import { Session } from 'next-auth'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LookBook',
  description: 'Save your looks and share them with the world.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
  session: Session
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider >
          {children}
        </Provider>
      </body>
    </html>
  )
}
