import { Provider } from '@components/Provider'
import type { Metadata } from 'next'
import { Session } from 'next-auth'
import { Oswald } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'


const montserrat = localFont({
  src: [
    { path: '../public/fonts/MontserratAlt1-SemiBold.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/MontserratAlt1-ExtraBold.woff2', weight: '800', style: 'normal' },
  ]
})
const oswald = Oswald({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Expentrac',
  description: 'Track your recurrent expenses.',
  icons: '/favicon.ico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
  session: Session
}) {
  return (
    <html lang="en">
      <body className={`${oswald.className} ${montserrat.className} bg-primary text-black`}>
        <Provider >
          {children}
        </Provider>
      </body>
    </html>
  )
}
