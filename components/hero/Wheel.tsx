import Image from 'next/image'

import ImgCoin from '@public/coin.webp'
import ImgFinance from '@public/finance.webp'
import ImgVods from '@public/vods.webp'

export const Wheel = () => {
  return <div className='
    absolute aspect-square
    h-screen md:h-[110vh] md:-top-[5vh]
    left-[20vw] xl:left-[30vw]
    rounded-full border border-slate-200/40 justify-center items-center overflow-hidden perspective-wheel shadow-bloom-md bg-slate-600 hidden sm:flex scroll-anim-fade'>
    <Image src={ImgCoin} placeholder='blur' layout='cover' alt='coins' className='absolute h-full w-full inset-0 bg-cover opacity-20 animate-spin-slowest saturate-0' />

    <div className='h-4/6 aspect-square rounded-full border border-slate-200/50 bg-slate-700 absolute shadow-bloom-md overflow-hidden -translate-x-5'>
      <Image src={ImgVods} placeholder='blur' layout='cover' alt='coins' className='absolute h-full w-full inset-0 bg-cover saturate-0 opacity-25 animate-spin-slower' />
    </div>

    <div className='h-2/6 aspect-square rounded-full border border-slate-400/50 absolute shadow-bloom-md overflow-hidden bg-slate-800 -translate-x-10'>
      <Image src={ImgFinance} placeholder='blur' layout='cover' alt='coins' className='absolute h-full w-full inset-0 bg-cover saturate-0 opacity-25 animate-spin-slow' />
    </div>
  </div>
}
