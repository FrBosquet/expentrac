'use client'
import { Button } from '@react-email/button'
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

  return <Button onClick={toggleDarkMode} className='cursor-pointer text-amber-500 dark:text-teal-200'>
    {darkMode ? <Moon /> : <Sun />}
  </Button>
}
