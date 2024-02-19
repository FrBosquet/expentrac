/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'mdx', 'ts'],
  experimental: {
    mdxRs: true,
    serverActions: true,
  },
}

const withMDX = require('@next/mdx')()
module.exports = withMDX(nextConfig)