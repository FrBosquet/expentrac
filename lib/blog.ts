import { mdxComponents } from '@components/mdxComponents'
import { readdirSync, readFileSync } from 'fs'
import { compileMDX } from 'next-mdx-remote/rsc'
import path from 'path'
import remarkUnwrapImages from 'remark-unwrap-images'

const POSTS_DIRECTORY = path.join(process.cwd(), 'app/(web)/blog/_posts')
export interface Post {
  slug: string
  title: string
  date: string
  published: boolean
  image: {
    src: string
    author: string
    authorUrl: string
    source: string
    sourceUrl: string
    className?: string
  }
}

export const getPostsFileNames = (): string[] => {
  const fileNames = readdirSync(POSTS_DIRECTORY)

  return fileNames
}

export const getPostSlugs = (): string[] => {
  const fileNames = getPostsFileNames()

  return fileNames.map((name) => name.replace('.mdx', ''))
}

export const getPosts = async (): Promise<Post[]> => {
  const fileNames = getPostsFileNames()

  const posts: Post[] = await Promise.all(
    fileNames.map(async (name) => {
      const filename = path.join(POSTS_DIRECTORY, name)
      const raw = readFileSync(filename)
      const { frontmatter } = await compileMDX<Post>({
        source: raw,
        components: mdxComponents,
        options: {
          parseFrontmatter: true
        }
      })

      return { ...frontmatter, slug: name.replace('.mdx', '') } as Post
    })
  )

  return posts
    .filter((post) => post.published)
    .sort((a, b) =>
      new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
    )
}

export const getPost = async (slug: string) => {
  const filename = path.join(POSTS_DIRECTORY, slug + '.mdx')
  const raw = readFileSync(filename)
  return await compileMDX<Post>({
    source: raw,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkUnwrapImages]
      }
    }
  })
}
