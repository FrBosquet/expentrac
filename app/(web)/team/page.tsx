import Image from 'next/image'

import { SectionTitle } from '@components/web/SectionTitle'
import me from '@public/me.webp'
import { GithubIcon } from 'lucide-react'

export default function Team() {
  return <section className='flex flex-1 flex-col gap-6 justify-center items-center relative p-10 w-full max-w-5xl m-auto'>
    <SectionTitle>team</SectionTitle>
    <article className='flex flex-col items-center'>
      <Image src={me} alt="Fran Bosquet" width={200} height={200} className='rounded-full shadow-bloom-sm mb-4' />
      <h2 className='text-3xl'>Fran Bosquet</h2>
      <p className='text-slate-300'>Full Stack developer</p>
      <p className='text-slate-400'>Madrid, Spain</p>
    </article>
    <p className='text-slate-300 max-w-lg text-center'>I started this project on my own just to control my loans ans subs, which where getting out of hand 😁. Also, to practice my web deb skills. If you have some ideas and want to colab, <a target='_blank' href="https://x.com/frbosquet" className='text-primary-300 font-semibold' rel="noreferrer">send me a DM in X</a></p>
    <p className='text-slate-300 max-w-lg text-center'>You can also check the repo and even fork and make a PR <a href="github.com/frbosquet/expentrac">in Github</a>. Eventually this project will become private.</p>
    <a target='_blank' href="https://github.com/frbosquet/expentrac" className='text-slate-200 bg-expentrac-800 max-w-lg text-center flex gap-3 bg-primary-600 p-3 shadow-md hover:bg-primary-300 transition rounded-md' rel="noreferrer"><GithubIcon /> Expentrac repository</a>
  </section>
}
