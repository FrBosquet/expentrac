import { MdxContent } from '@components/mdxComponents'
import { getPost } from '@lib/blog'
import { MoveLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: {
    slug: string
  }
}

export default async function Page({ params: { slug } }: Props) {
  const post = await getPost(slug)
  // const meta = post.frontmatter

  return <section className='flex flex-col gap-4 py-6 relative container max-w-[700px] mx-auto'>
    <aside className="sticky top-0 h-0 hidden md:block">
      <Link href="/blog" className="-left-20 p-8 text-white hover:text-teal-400 hover:-left-24 absolute transition-all">
        <MoveLeft className="w-6 h-6 transition-all" />
      </Link>
    </aside>
    {/* <PostHeader {...meta} /> */}
    <MdxContent source={post} />
  </section>
}

// export async function generateStaticParams() {
//   const filenames = getPostSlugs()

//   return filenames.map(slug => ({ slug }))
// }

// export async function generateMetadata(
//   { params }: Props
// ): Promise<Metadata> {
//   const post = await getPost(params.slug)

//   return {
//     title: post.frontmatter.title
//   }
// }
