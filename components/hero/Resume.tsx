import { Pen } from 'lucide-react'
import Image from 'next/image'

export const Resume = () => {
  return <section className='h-[75vh] bg-slate-900 shadow-bloom-sm'>
    <div className='h-full gap-6 max-w-screen-xl w-full items-start p-6 m-auto grid grid-cols-2 grid-rows-2'>
      <article className='perspective-container col-start-1 row-span-2 self-center'>
        <Image src='/screenshots/dashboard.png' alt="" width={500} height={500} className='rotate-3d max-w-[50%] m-auto shadow-lg animate-scroll' />
      </article>

      <h1 className='text-6xl self-end'><Pen className='inline' /> Track whatever you need</h1>
      <p className='text-slate-400'>Expentrac allows you to easily record and manage all your recurring expenses, from your mortgage payment to subscriptions to services like Netflix. Don&rsquo;t waste time tracking each expense manually; with Expentrac, everything is just a click away. Efficiently record your loan payments and subscriptions, and maintain complete control of your personal finances</p>
    </div>
  </section>
}
