import { SectionTitle } from '@components/web/SectionTitle'
import { getPosts } from '@lib/blog'
import Link from 'next/link'

export default async function Blog() {
  const posts = await getPosts()

  return (
    <section className="relative m-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-start gap-2 py-16 md:py-0">
      <SectionTitle>Blog</SectionTitle>
      {posts.map((post) => (
        <Link
          key={post.slug}
          className="group flex w-full gap-4 text-xl text-slate-300 transition hover:text-primary-300"
          href={`/blog/${post.slug}`}
        >
          <p className="flex-1 text-right text-sm text-slate-400 transition group-hover:text-primary-800">
            {new Date(post.date).toLocaleDateString()}
          </p>
          <p className="flex-[2]">{post.title}</p>
        </Link>
      ))}
    </section>
  )
}
