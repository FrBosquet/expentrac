'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function Page() {
  const { data } = useSession()

  if (data) {
    redirect('/dashboard')
  }

  return (
    <>
      <h1 className="text-4xl uppercase tracking-wide">Login</h1>
      <p>Hi!</p>
    </>
  )
}