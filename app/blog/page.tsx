import { getPosts } from '@lib/blog'
import { Pen } from 'lucide-react'
import Link from 'next/link'

export default async function Blog() {
  const posts = await getPosts()

  return <>
    <h1 className='text-6xl pb-4 mb-6 border-b'><Pen size={36} className='inline' /> Blog</h1>
    {
      posts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className='text-xl flex gap-4 text-slate-300 hover:text-primary-300 py-4 group transition'>
          <p className='text-slate-600 group-hover:text-primary-800 transition'>{new Date(post.date).toLocaleDateString()}</p>
          {post.title}
        </Link>
      ))
    }
  </>
}
