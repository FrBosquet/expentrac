import ImgCoin from '@public/coin.webp'
import ImgFinance from '@public/finance.webp'
import ImgVods from '@public/vods.webp'
import Image from 'next/image'

export const Wheel = () => {
  return (
    <div
      className="
    perspective-wheel absolute
    left-[20vw] hidden aspect-square
    h-screen items-center
    justify-center overflow-hidden rounded-full border border-slate-200/40 bg-slate-600 shadow-bloom-md scroll-anim-fade sm:flex md:top-[-5vh] md:h-[110vh] xl:left-[30vw]"
    >
      <Image
        alt="coins"
        className="absolute inset-0 size-full animate-spin-slowest bg-cover opacity-20 saturate-0"
        placeholder="blur"
        src={ImgCoin}
      />

      <div className="absolute aspect-square h-4/6 -translate-x-5 overflow-hidden rounded-full border border-slate-200/50 bg-slate-700 shadow-bloom-md">
        <Image
          alt="coins"
          className="absolute inset-0 size-full animate-spin-slower bg-cover opacity-25 saturate-0"
          placeholder="blur"
          src={ImgVods}
        />
      </div>

      <div className="absolute aspect-square h-2/6 -translate-x-10 overflow-hidden rounded-full border border-slate-400/50 bg-slate-800 shadow-bloom-md">
        <Image
          alt="coins"
          className="absolute inset-0 size-full animate-spin-slow bg-cover opacity-25 saturate-0"
          placeholder="blur"
          src={ImgFinance}
        />
      </div>
    </div>
  )
}
