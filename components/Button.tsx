import { ButtonHTMLAttributes } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({ children, className = '', ...props }: Props) => {
  return <button className={`btn ${className}`} {...props}>{children}</button>
}