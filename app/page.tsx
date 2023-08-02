'use client'

import { AiOutlineGoogle } from "@components/Icons"
import { Logo } from "@components/Logo"
import { Button } from "@components/ui/button"
import { signIn, useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function Home() {
  const { data: session } = useSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="p-12 flex flex-col gap-4 justify-center h-screen items-center w-screen bg-primary">
      <Logo className="text-8xl">expentrac</Logo>
      <Button onClick={() => signIn('google')}><AiOutlineGoogle /></Button>
    </main>
  )
}
