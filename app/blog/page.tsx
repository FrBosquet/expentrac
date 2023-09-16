import Link from 'next/link'

const posts = [
  { title: 'Bootstrap', slug: 'bootstrap', date: '2023/09/16' }
]

export default function Blog() {
  return <>
    <h1 className='text-6xl mb-6 border-b'>Blog</h1>
    {
      posts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className='text-xl flex gap-4 hover:text-primary-300'>
          <p className='text-slate-400'>{new Date(post.date).toLocaleDateString()}</p>
          {post.title}

        </Link>
      ))
    }
  </>
}
