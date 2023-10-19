'use client'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { createContext, useLayoutEffect, useState, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

import { SessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { TooltipProvider } from './ui/tooltip'

const montserrat = localFont({
  src: [
    { path: '../public/fonts/MontserratAlt1-SemiBold.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/MontserratAlt1-ExtraBold.woff2', weight: '800', style: 'normal' }
  ],
  variable: '--font-montserrat'
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export interface DarkModeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
}

export const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => null
})

const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    const localStorageValue = window.localStorage.getItem('darkMode')

    if (localStorageValue === null) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    return localStorageValue === 'true'
  }
  return true
}

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(true)

  useLayoutEffect(() => {
    setDarkMode(getInitialDarkMode())
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(value => {
      window.localStorage.setItem('darkMode', String(!value))

      return !value
    })
  }

  const forceDarkMode = pathname.includes('dashboard')
    ? darkMode
    : true

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <SessionProvider>
        <TooltipProvider delayDuration={75}>
          <body className={twMerge(inter.variable, montserrat.variable, 'font-sans [view-timeline-name: fall] bg-theme-back border-theme-border text-foreground', forceDarkMode && 'dark')}>
            {children}
          </body>
        </TooltipProvider>
      </SessionProvider>
    </DarkModeContext.Provider >
  )
}
