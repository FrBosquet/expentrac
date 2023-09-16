import { Rocket } from 'lucide-react'
import { RegularSignin } from './signin'

export const StartNow = () => {
  return <section className='h-[80vh] bg-gradient-to-t from-slate-900 to-slate-800'>
    <div className='h-full gap-12 max-w-screen-xl w-full items-center p-6 m-auto justify-center
      flex
    '>
      <Rocket className='text-primary-600 drop-shadow-lg' size={270} />

      <article className='flex flex-col gap-8 justify-center items-start'>
        <h1 className='text-6xl scroll-anim-fall text-primary-600'>Start tracking today</h1>
        <p className='text-slate-400'>Expentrac is free to use. You just need an email account.</p>
        <RegularSignin />
      </article>
    </div>
  </section>
}
