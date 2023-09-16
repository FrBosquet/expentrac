import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className='text-6xl py-10 border-b border-b-slate-400'>{children}</h1>,
    h2: ({ children }) => <h2 className='text-5xl py-8'>{children}</h2>,
    p: ({ children }) => <p className='text-lg py-[2rem] text-slate-300 leading-5'>{children}</p>,
    li: ({ children }) => <li className='text-lg py-[2rem] text-slate-300 leading-5 pr-4'> - {children}</li>,
    ...components
  }
}
