import 'server-only'

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export const POSTS_DIRECTORY = path.join(process.cwd(), 'app/(web)/blog/_posts')
export interface Post {
  slug: string
  title: string
  date: string
  published: boolean
  image?: {
    src: string
    author: string
    authorUrl: string
    source: string
    sourceUrl: string
    className?: string
  }
}

export function getPostsFileNames() {
  return readdirSync(POSTS_DIRECTORY, { withFileTypes: true })
    .filter(
      (file) =>
        file.isFile() && /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/.test(file.name)
    )
    .map((file) => file.name)
}

export function getPostMetadata(slug: string): Post | undefined {
  if (!getPostsFileNames().includes(`${slug}.mdx`)) return undefined
  const { data } = matter(
    readFileSync(path.join(POSTS_DIRECTORY, `${slug}.mdx`), 'utf8')
  )
  if (data.published !== true) return undefined
  if (
    typeof data.title !== 'string' ||
    typeof data.date !== 'string' ||
    !Number.isFinite(Date.parse(data.date))
  )
    throw new Error(`Invalid blog metadata: ${slug}`)
  return { ...data, slug } as Post
}

export function getPosts(): Post[] {
  return getPostsFileNames()
    .map((name) => getPostMetadata(name.slice(0, -4)))
    .filter((post): post is Post => Boolean(post))
    .sort(
      (a, b) =>
        Date.parse(b.date) - Date.parse(a.date) || a.slug.localeCompare(b.slug)
    )
}

export const getPostSlugs = () => getPosts().map(({ slug }) => slug)
