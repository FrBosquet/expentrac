'use client'

import { Logo } from "@components/Logo"
import { signOut, useSession } from "next-auth/react"

export default function Page() {
  const { data } = useSession({
    required: true,
  })

  if (!data || !data.user) return null

  return (
    <main className="flex flex-col min-h-screen">
      <header className="flex gap-4 bg-white p-2 justify-between items-center border-b border-gray-300">
        <Logo className="text-4xl">et</Logo>
        <button className="inline-block" onClick={() => signOut()}>Sign out</button>
        <img src={data.user.image as string} alt={data.user.name as string} className="rounded-full w-12 h-12" />
      </header>

      <section className="flex-1 bg-white p-2">
        <h1 className="text-4xl uppercase">My<span className="text-gray-700">dashboard</span></h1>
      </section>

      <footer className="flex gap-4 bg-white p-2 justify-between items-center border-t border-gray-300">
        footer
      </footer>
    </main>
  )
}
