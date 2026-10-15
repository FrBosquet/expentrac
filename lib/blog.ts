import 'server-only'

import { mdxComponents } from '@components/mdxComponents'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import { cache } from 'react'
import remarkUnwrapImages from 'remark-unwrap-images'

import { getPostMetadata, POSTS_DIRECTORY, type Post } from './blog-metadata'
export {
  getPosts,
  getPostSlugs,
  getPostsFileNames,
  getPostMetadata,
  type Post
} from './blog-metadata'

// Memoize compilation within a render. Published pages are statically built.
export const getPost = cache(async (slug: string) => {
  const frontmatter = getPostMetadata(slug)
  if (!frontmatter) notFound()
  const raw = readFileSync(path.join(POSTS_DIRECTORY, `${slug}.mdx`), 'utf8')
  const { content } = await compileMDX<Post>({
    source: raw,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: [remarkUnwrapImages] }
    }
  })
  return { frontmatter, content }
})
