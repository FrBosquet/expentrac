'use client'

import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote'
import { type HTMLAttributes } from 'react'

interface MdxContentProps {
  source: MDXRemoteSerializeResult
}

const code = (props: HTMLAttributes<HTMLElement>) => {
  const { children } = props

  const isBlock = (children as string).includes('\n')

  return (
    <code
      {...props}
      className={'bg-gray-900 text-green-300 p-1 rounded-md'.concat(
        isBlock ? 'w-full p-6 block overflow-x-scroll' : ''
      )}
    >
      {props.children}
    </code>
  )
}

export const mdxComponents = {
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mb-6 border-b pb-4 text-6xl font-semibold">
      {props.children}
    </h1>
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-4 text-4xl font-medium text-orange-300">
      {props.children}
    </h2>
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-1 text-base text-orange-200 ">{props.children}</h3>
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p className="pb-3 text-base font-light leading-7">{props.children}</p>
  ),
  img: (props: any) => (
    <div className="my-4 flex flex-col items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={props.alt} className="mb-1 w-auto" src={props.src} />
      <p className="font-thin">{props.alt}</p>
    </div>
  ),
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="mb-4 rounded-lg bg-gray-800 p-3 text-lg italic text-slate-400 shadow-md">
      {props.children}
    </blockquote>
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4">{props.children}</ul>
  ),
  li: (props: HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-4 list-item list-disc">{props.children}</li>
  ),
  a: (props: HTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-orange-400 visited:text-teal-300"
      target="_blank"
    >
      {props.children}
    </a>
  ),
  em: (props: HTMLAttributes<HTMLElement>) => (
    <em {...props} className="font-light text-gray-400">
      {props.children}
    </em>
  ),
  code
}

export const MdxContent = ({ source }: MdxContentProps) => {
  return <MDXRemote {...source} components={mdxComponents} />
}
