import { Wheel } from "./Wheel"
import { SignInRegular } from "./signin"

export const Hero = () => {
  return <>
    <article className='absolute top-1/2 left-1/4 text-slate-200 opacity-5 text-8xl -translate-y-[50%] scale-[200%] font-semibold blur-xs'>
      <p>Your finances</p>
      <p>under your control</p>
    </article>

    <Wheel />

    <article className="relative flex flex-col h-screen w-screen items-center ">
      <div className='flex-1 flex flex-col justify-center gap-6 max-w-screen-xl w-full items-start p-6'>
        <h1 className='text-slate-200 text-6xl sm:text-8xl leading-tight animate-fall'>Your finances <br /><span className='text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary font-semibold'>under your control</span></h1>

        <p className='text-slate-300 max-w-md'>Expentrac allows you to keep track of your loans and subscriptions your way: without external dependencies and providing just the information that you want. Easy. Simple.</p>
        <SignInRegular className='self-center' />
      </div>
    </article>
  </>
}