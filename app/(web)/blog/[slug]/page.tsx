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
  return (
    <>
      <header className="mb-4 flex flex-col border-b-2 border-slate-300 pb-2">
        <h1 className="inline-block bg-gradient-to-r from-theme to-theme-accent bg-clip-text py-2 text-6xl text-transparent">
          {title}
        </h1>
        <span className="text-sm text-slate-500">
          {fullDateFormater.format(new Date(date))}
        </span>
        {image ? (
          <>
            <div className="relative my-2 h-60 w-full overflow-hidden shadow-lg">
              <Image
                fill
                alt="splash"
                className={twMerge('object-cover', image.className)}
                src={`/${image.src}`}
              ></Image>
            </div>{' '}
            <section className="pb-1 text-xs text-slate-600">
              <div>
                Photo by{' '}
                <a
                  className="text-slate-500 transition hover:text-primary-300"
                  href={image.authorUrl}
                >
                  {image.author}
                </a>{' '}
                {image.sourceUrl ? (
                  <>
                    in{' '}
                    <a
                      className="text-slate-500 transition hover:text-primary-300"
                      href={image.sourceUrl}
                    >
                      {image.source}
                    </a>
                  </>
                ) : null}
              </div>
            </section>
          </>
        ) : null}
      </header>
    </>
  )
}

export default async function Page({ params: { slug } }: Props) {
  const post = await getPost(slug)
  const meta = post.frontmatter as Post

  return (
    <section className="relative m-auto flex w-full max-w-5xl flex-1 flex-col justify-start gap-4 px-4 py-6">
      <aside className="sticky top-0 hidden h-0 md:block">
        <Link
          className="absolute -left-20 p-8 text-white transition-all hover:-left-24 hover:text-teal-400"
          href="/blog"
        >
          <MoveLeft className="size-6 transition-all" />
        </Link>
      </aside>
      <PostHeader {...meta} />
      <MdxContent source={post} />
    </section>
  )
}

export async function generateStaticParams() {
  const filenames = getPostSlugs()

  return filenames.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.frontmatter.title
  }
}
