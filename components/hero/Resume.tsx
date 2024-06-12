import { Pen } from 'lucide-react'
import Image from 'next/image'

export const Resume = () => {
  return (
    <section className="h-[80vh] bg-slate-800 shadow-2xl">
      <div
        className="
      m-auto grid size-full max-w-screen-xl grid-cols-1 grid-rows-2 items-start gap-6
      p-6 md:grid-cols-2
    "
      >
        <article className="col-start-1 row-span-2 hidden self-center perspective-container md:block">
          <Image
            alt=""
            className="m-auto max-w-[50%] shadow-lg scroll-anim-snapshot"
            height={500}
            src="/screenshots/dashboard.png"
            width={500}
          />
        </article>

        <h1 className="self-end text-6xl text-theme-accent scroll-anim-fall">
          <Pen className="inline" size={36} /> Track whatever you need
        </h1>
        <p className="text-slate-400">
          Expentrac allows you to easily record and manage all your recurring
          expenses, from your mortgage payment to subscriptions to services like
          Netflix. Don&rsquo;t waste time tracking each expense manually; with
          Expentrac, everything is just a click away. Efficiently record your
          loan payments and subscriptions, and maintain complete control of your
          personal finances
        </p>
      </div>
    </section>
  )
}
