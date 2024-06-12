import './globals.css'

import { RootProvider } from '@components/Provider'
import { DarkModeProvider } from '@components/root-provider'
import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'

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
      <DarkModeProvider>
        <RootProvider>
          <NextTopLoader color="#2dff87" showSpinner={false} />
          {children}
        </RootProvider>
      </DarkModeProvider>
    </html>
  )
}
