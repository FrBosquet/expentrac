'use client'

import { signOut, useSession } from "next-auth/react"

export default function Page() {
  const { data } = useSession({
    required: true,
  })

  if (!data || !data.user) return null

  return (
    <>
      <h1 className="text-4xl uppercase tracking-tighter">My<span className="text-gray-400">dashboard</span></h1>
      <p>Hi {data.user.name}!</p>
      <button onClick={() => signOut()}>Sign out</button>
    </>
  )
}
