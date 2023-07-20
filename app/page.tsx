import { sql } from '@vercel/postgres'

export default async function Home() {
  const { rows } = await sql`SELECT 1 + 3`

  return (
    <>
      <h1 className="text-4xl uppercase tracking-wide">My Look Book</h1>
    </>
  )
}
