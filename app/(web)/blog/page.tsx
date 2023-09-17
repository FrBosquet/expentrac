import { SectionTitle } from '@components/web/SectionTitle'
import { getPosts } from '@lib/blog'
import Link from 'next/link'

export default async function Blog() {
  const posts = await getPosts()

  return <section className='flex flex-col flex-1 gap-2 justify-start items-center relative py-16 md:py-0 w-full max-w-5xl m-auto'>
    <SectionTitle>Blog</SectionTitle>
    {
      posts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className='w-full text-xl flex gap-4 text-slate-300 hover:text-primary-300 group transition'>
          <p className='text-slate-400 text-right group-hover:text-primary-800 transition text-sm flex-1'>{new Date(post.date).toLocaleDateString()}</p>
          <p className='flex-[2]'>{post.title}</p>
        </Link>
      ))
    }
  </section>
}
