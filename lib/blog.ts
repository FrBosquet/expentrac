import { readFileSync, readdirSync } from 'fs'
import { type MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'

const POSTS_DIRECTORY = path.join(process.cwd(), 'app/blog/_posts')

interface Post {
  title: string
  slug: string
  date: string
  published: boolean
}

export const getPostsFileNames = (): string[] => {
  const fileNames = readdirSync(POSTS_DIRECTORY)

  return fileNames
}

export const getPostSlugs = (): string[] => {
  const fileNames = getPostsFileNames()

  return fileNames.map(name => name.replace('.mdx', ''))
}

export const getPosts = async (tag?: string): Promise<Post[]> => {
  const fileNames = getPostsFileNames()

  const posts: Post[] = await Promise.all(fileNames.map(async name => {
    const filename = path.join(POSTS_DIRECTORY, name)
    const raw = readFileSync(filename)
    const serilized = await serialize(raw, {
      parseFrontmatter: true
    })

    const meta = serilized.frontmatter as unknown as Post

    const post: Post = {
      ...meta,
      slug: name.replace('.mdx', '')
    }

    return post
  }))

  return posts
    .filter(post => post.published)
    .sort((a, b) => new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1)
}

export const getPost = async (slug: string) => {
  const filename = path.join(POSTS_DIRECTORY, slug + '.mdx')
  const raw = readFileSync(filename)
  const serialized = await serialize(raw, {
    parseFrontmatter: true
  })

  return serialized as MDXRemoteSerializeResult & { frontmatter: Post }
}
