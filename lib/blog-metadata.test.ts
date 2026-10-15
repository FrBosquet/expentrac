import { getPostMetadata, getPosts, getPostSlugs } from './blog-metadata'

test.each([
  '../hello-world',
  '../../../../../.env.local',
  '%2e%2e%2fhello-world',
  'hello-world.mdx',
  'missing',
  'HELLO-WORLD'
])('unknown or unsafe slug %s is not read', (slug) => {
  expect(getPostMetadata(slug)).toBeUndefined()
})

test('published inventory has valid metadata in reverse chronological order without compiling MDX', () => {
  const posts = getPosts()
  expect(posts.length).toBeGreaterThan(0)
  expect(new Set(getPostSlugs()).size).toBe(posts.length)
  expect(posts.every((post) => post.published && post.title)).toBe(true)
  expect(posts.map((post) => Date.parse(post.date))).toEqual(
    posts.map((post) => Date.parse(post.date)).sort((a, b) => b - a)
  )
  expect(getPostMetadata('hello-world')?.title).toBe('👋 Hello world!')
})
