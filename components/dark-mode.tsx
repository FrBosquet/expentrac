'use client'
import { Button } from '@components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useContext } from 'react'

import { DarkModeContext } from './root-provider'

export const useDarkMode = () => {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }

  return context
}

export const DarkModeTogle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleDarkMode}
    >
      {darkMode ? <Moon /> : <Sun />}
    </Button>
  )
}
