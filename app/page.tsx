import Link from "next/link";

export default async function Home() {
  return (
    <main className="p-12 flex flex-col gap-4">
      <h1 className="text-4xl uppercase tracking-tighter">My<span className="text-gray-400">look</span>book</h1>
      <Link className="hover:text-gray-400 transition-all inline-block" href="/login">login</Link>
    </main>
  )
}
