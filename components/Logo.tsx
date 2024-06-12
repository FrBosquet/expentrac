'use client'

interface Props {
  className?: string
  children: React.ReactNode
}

export const Logo = ({ className, children }: Props) => {
  return (
    <h1
      className={`bg-gradient-to-r from-expentrac-800 to-theme-accent bg-clip-text font-logo font-extrabold uppercase text-transparent dark:from-expentrac ${className}`}
    >
      {children}
    </h1>
  )
}
