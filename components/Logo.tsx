'use client'


type Props = {
  className?: string
  children: React.ReactNode
}

export const Logo = ({ className, children }: Props) => {
  return (
    <h1 className={`text-transparent bg-clip-text bg-gradient-to-r from-gradient-start to-gradient-end font-logo uppercase font-extrabold ${className}`}>
      {children}
    </h1>
  )
}