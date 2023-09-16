import { Rocket } from 'lucide-react'
import { RegularSignin } from './signin'

export const StartNow = () => {
  return <section className='h-[80vh] bg-gradient-to-t from-slate-900 to-slate-800'>
    <div className='h-full gap-6 max-w-screen-xl w-full items-center p-6 m-auto grid grid-cols-2 justify-center'>
      <article className='perspective-container self-center'>
        <Rocket className='m-auto text-primary-600' size={270} />
      </article>

      <article className='flex flex-col gap-8 w-full justify-center items-start'>
        <h1 className='text-6xl animate-scroll-from-above text-primary-600'>Start tracking today</h1>
        <p className='text-slate-400'>Expentrac is free to use. You just need an email account.</p>
        <RegularSignin />
      </article>
    </div>
  </section>
}
