import { MdxContent } from '@components/mdxComponents'
import { getPost, getPostSlugs, type Post } from '@lib/blog'
import { fullDateFormater } from '@lib/dates'
import { MoveLeft } from 'lucide-react'
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface Props {
  params: {
    slug: string
  }
}

const PostHeader = ({ title, date, image }: Post) => {
  return <>
    <header className="border-b-2 border-slate-300 pb-2 mb-4 flex flex-col">
      <h1 className="text-6xl bg-gradient-to-r from-primary-300 to-secondary text-transparent py-2 bg-clip-text inline-block">{title}</h1>
      <span className="text-sm text-slate-500">{fullDateFormater.format(new Date(date))}</span>
      {image
        ? <><div className="w-full h-60 relative overflow-hidden my-2 shadow-lg">
          <Image alt="splash" src={`/${image.src}`} fill className={twMerge('object-cover', image.className)}></Image>
        </div> <section className="text-slate-600 pb-1 text-xs">
            <div>Photo by <a className="text-slate-500 transition hover:text-primary-300" href={image.authorUrl}>{image.author}</a> {image.sourceUrl ? <>in <a className="text-slate-500 transition hover:text-primary-300" href={image.sourceUrl}>{image.source}</a></> : null}</div>
          </section></>
        : null}
    </header>
  </>
}

export default async function Page({ params: { slug } }: Props) {
  const post = await getPost(slug)
  const meta = post.frontmatter as Post

  return <section className='flex flex-col gap-4 py-6 relative'>
    <aside className="sticky top-0 h-0 hidden md:block">
      <Link href="/blog" className="-left-20 p-8 text-white hover:text-teal-400 hover:-left-24 absolute transition-all">
        <MoveLeft className="w-6 h-6 transition-all" />
      </Link>
    </aside>
    <PostHeader {...meta} />
    <MdxContent source={post} />
  </section>
}

export async function generateStaticParams() {
  const filenames = getPostSlugs()

  return filenames.map(slug => ({ slug }))
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.frontmatter.title
  }
}
