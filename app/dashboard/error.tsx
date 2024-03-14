'use client'

import Broken from '@/public/broken.png'
import Image from 'next/image'

export default function Page() {
  return <div className="col-span-2 lg:col-span-4 grid gap-2 place-content-center h-screen">
    <Image src={Broken} alt="something went off" />
    <h1 className="text-center text-4xl text-theme-accent font-semibold">Something went off!</h1>
    <p className="text-center text-md text-theme-light">please try again</p>
  </div>
}
