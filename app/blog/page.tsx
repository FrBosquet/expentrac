import { SectionTitle } from '@components/web/SectionTitle'
import { getPosts } from '@lib/blog'
import Link from 'next/link'

export default async function Blog() {
  const posts = await getPosts()

  return <section className='flex flex-col gap-12 justify-center items-center relative p-16 md:p-0'>
    <SectionTitle>Blog</SectionTitle>
    {
      posts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className='text-xl flex gap-4 text-slate-300 hover:text-primary-300 py-4 group transition'>
          <p className='text-slate-600 group-hover:text-primary-800 transition'>{new Date(post.date).toLocaleDateString()}</p>
          {post.title}
        </Link>
      ))
    }
  </section>
}
