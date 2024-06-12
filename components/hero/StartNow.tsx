import { Rocket } from 'lucide-react'

import { SignInRegular } from './signin'

export const StartNow = () => {
  return (
    <section className="h-[80vh] bg-gradient-to-t from-slate-900 to-slate-800 text-theme">
      <div
        className="m-auto flex size-full max-w-screen-xl items-center justify-center gap-12 p-6
    "
      >
        <Rocket
          className="hidden drop-shadow-lg scroll-anim-rise md:block"
          size={270}
        />

        <article className="flex flex-col items-start justify-center gap-8">
          <h1 className="text-6xl text-primary-600 scroll-anim-fall">
            Start tracking today
          </h1>
          <p className="text-slate-400">
            Expentrac is free to use. You just need an email account.
          </p>
          <SignInRegular />
        </article>
      </div>
    </section>
  )
}
