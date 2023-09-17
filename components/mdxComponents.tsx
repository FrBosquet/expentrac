'use client'

import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote'
import { type HTMLAttributes } from 'react'

interface MdxContentProps {
  source: MDXRemoteSerializeResult
}

const code = (props: HTMLAttributes<HTMLElement>) => {
  const { children } = props

  const isBlock = (children as string).includes('\n')

  return <code {...props} className={'bg-gray-900 text-green-300 p-1 rounded-md'.concat(isBlock ? 'w-full p-6 block overflow-x-scroll' : '')}>{props.children}</code>
}

export const mdxComponents = {
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => <h1 className='text-6xl font-semibold border-b pb-4 mb-6'>{props.children}</h1>,
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => <h2 className='text-4xl font-medium text-orange-300 mb-4'>{props.children}</h2>,
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => <h3 className='text-md text-orange-200 mb-1 '>{props.children}</h3>,
  p: (props: HTMLAttributes<HTMLParagraphElement>) => <p className='text-md font-ligth pb-3 leading-7'>{props.children}</p>,
  img: (props: any) => <div className="flex flex-col items-center my-4">
    <img className="w-auto mb-1" alt={props.alt} src={props.src} />
    <p className="font-thin">{props.alt}</p>
  </div>,
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => <blockquote className="p-3 bg-gray-800 rounded-lg mb-4 shadow-md text-lg italic text-slate-400">{props.children}</blockquote>,
  ul: (props: HTMLAttributes<HTMLUListElement>) => <ul className="mb-4">{props.children}</ul>,
  li: (props: HTMLAttributes<HTMLLIElement>) => <li className="ml-4 list-item list-disc">{props.children}</li>,
  a: (props: HTMLAttributes<HTMLAnchorElement>) => <a {...props} target="_blank" className="text-orange-400 visited:text-teal-300">{props.children}</a>,
  em: (props: HTMLAttributes<HTMLElement>) => <em {...props} className="font-ligh text-gray-400">{props.children}</em>,
  code
}

export const MdxContent = ({ source }: MdxContentProps) => {
  return <MDXRemote {...source} components={mdxComponents} />
}
