'use client'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { createContext, type ReactNode, useLayoutEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  fallback: ['sans-serif']
})

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
    setDarkMode((value) => {
      window.localStorage.setItem('darkMode', String(!value))

      return !value
    })
  }

  const forceDarkMode = pathname.includes('dashboard') ? darkMode : true

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <SessionProvider>
        <body
          className={twMerge(
            inter.variable,
            'font-sans [view-timeline-name: fall] bg-theme-back border-theme-border text-foreground',
            forceDarkMode && 'dark'
          )}
        >
          {children}
        </body>
      </SessionProvider>
    </DarkModeContext.Provider>
  )
}
