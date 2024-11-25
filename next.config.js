/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'mdx', 'ts'],
  experimental: {
    mdxRs: true
  },
  images: {
    domains: ['asset.brandfetch.io'],
  },
}

const withMDX = require('@next/mdx')()
module.exports = withMDX(nextConfig)