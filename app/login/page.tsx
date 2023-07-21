'use client'

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function Page() {
  const { data } = useSession()

  if (data) {
    redirect('/dashboard')
  }

  return (
    <main className="flex justify-center items-center h-screen flex-col gap-2">
      <h1 className="text-4xl uppercase tracking-wide">Login</h1>
      <ul>
        <li>
          <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={() => signIn('google')}>
            <FcGoogle />
          </button>
        </li>
      </ul>
    </main>
  )
}