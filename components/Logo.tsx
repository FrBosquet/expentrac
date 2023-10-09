'use client'

interface Props {
  className?: string
  children: React.ReactNode
}

export const Logo = ({ className, children }: Props) => {
  return (
    <h1 className={`text-transparent bg-clip-text bg-gradient-to-r from-expentrac-800 dark:from-expentrac to-theme-accent font-logo uppercase font-extrabold ${className}`}>
      {children}
    </h1>
  )
}
