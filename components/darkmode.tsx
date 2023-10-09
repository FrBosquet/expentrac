'use client'
import { Button } from '@react-email/button'
import { Moon, Sun } from 'lucide-react'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export interface DarkModeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
}

export const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => null
})

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(true)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <main className={twMerge('flex flex-col min-h-screen border-theme-border bg-theme-back text-foreground', darkMode && 'dark')}>
        {children}
      </main>
    </DarkModeContext.Provider >
  )
}

export const useDarkMode = () => {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }

  return context
}

export const DarkModeTogle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode()

  return <Button onClick={toggleDarkMode} className='cursor-pointer text-amber-500 dark:text-teal-200'>
    {darkMode ? <Moon /> : <Sun />}
  </Button>
}
