'use client'

import Image from 'next/image'

export default function Page() {
  return (
    <div className="col-span-2 grid h-screen place-content-center gap-2 lg:col-span-4">
      <Image
        alt="something went off"
        height={500}
        src="/broken.png"
        width={500}
      />
      <h1 className="text-center text-4xl font-semibold text-theme-accent">
        Something went off!
      </h1>
      <p className="text-center text-base text-theme-light">please try again</p>
    </div>
  )
}
