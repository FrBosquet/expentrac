import { PropsWithChildren } from "react"

export default function Page({ children }: PropsWithChildren) {
  return (
    <div className="page">
      <div className="page__content">{children}</div>
    </div>
  )
}