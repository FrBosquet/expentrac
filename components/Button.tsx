import { ButtonHTMLAttributes } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({ children, className = '', ...props }: Props) => {
  return <button className={`bg-gray-700 hover:bg-secondary hover:text-primary transition-colors text-white font-bold py-2 px-4 rounded ${className}`} {...props}>{children}</button>
}