import { SectionTitle } from '@components/web/SectionTitle'
import me from '@public/me.webp'
import { GithubIcon } from 'lucide-react'
import Image from 'next/image'

export default function Team() {
  return (
    <section className="relative m-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6 p-10">
      <SectionTitle>team</SectionTitle>
      <article className="flex flex-col items-center">
        <Image
          alt="Fran Bosquet"
          className="mb-4 rounded-full shadow-bloom-sm"
          height={200}
          src={me}
          width={200}
        />
        <h2 className="text-3xl">Fran Bosquet</h2>
        <p className="text-slate-300">Full Stack developer</p>
        <p className="text-slate-400">Madrid, Spain</p>
      </article>
      <p className="max-w-lg text-center text-slate-300">
        I started this project on my own just to control my loans ans subs,
        which where getting out of hand 😁. Also, to practice my web deb skills.
        If you have some ideas and want to colab,{' '}
        <a
          className="font-semibold text-primary-300"
          href="https://x.com/frbosquet"
          rel="noreferrer"
          target="_blank"
        >
          send me a DM in X
        </a>
      </p>
      <p className="max-w-lg text-center text-slate-300">
        You can also check the repo and even fork and make a PR{' '}
        <a href="github.com/frbosquet/expentrac">in Github</a>. Eventually this
        project will become private.
      </p>
      <a
        className="flex max-w-lg gap-3 rounded-md bg-expentrac-800 p-3 text-center text-slate-200 shadow-md transition hover:bg-primary-300"
        href="https://github.com/frbosquet/expentrac"
        rel="noreferrer"
        target="_blank"
      >
        <GithubIcon /> Expentrac repository
      </a>
    </section>
  )
}
