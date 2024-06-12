/* eslint-disable prettier/prettier */
import { Cable, Combine, Send, Users } from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    title: (
      <>
        <Cable className="inline" /> Connected
      </>
    ),
    description:
      'Expentrac provides you with the ability to associate each of your expenses with their respective providers. This means you can easily track where you\'re making payments and where you\'ve made purchases',
    image: '/screenshots/providers.png',
    alt: 'provider connections'
  },

  {
    title: (
      <>
        <Users className="inline" /> Social
      </>
    ),
    description:
      'Expentrac goes beyond individual finance management. With our app, you can effortlessly share your expenses with friends or family members. Whether you\'re splitting bills, managing joint finances, or simply keeping each other in the loop, our easy-to-use sharing feature allows you to collaborate seamlessly. ',
    image: '/screenshots/providers.png',
    alt: 'payment sharing'
  },
  {
    title: (
      <>
        <Send className="inline" /> Smart
      </>
    ),
    description:
      'Set up email notifications for payments to yourself or anyone else, ensuring you stay ahead of your financial commitments. Whether it\'s a reminder for your own expenses or to help someone else, our email notification feature keeps you organized and financially prepared',
    image: '/screenshots/providers.png',
    alt: 'email notifications'
  }
]

export const Feature = ({
  title,
  description,
  image,
  alt
}: {
  title: string | JSX.Element
  description: string | JSX.Element
  image: string
  alt: string
}) => {
  return (
    <>
      <Image
        alt={alt}
        className="row-start-2 hidden rounded-full shadow-lg scroll-anim-rise md:block"
        height={300}
        src={image}
        width={300}
      />
      <h3 className="whitespace-nowrap text-center text-4xl uppercase tracking-wider text-theme-accent scroll-anim-rise md:row-start-3">
        {title}
      </h3>
      <p className="text-center text-slate-300 scroll-anim-rise md:row-start-4">
        {description}
      </p>
    </>
  )
}

export const Features = () => {
  const [connected, social, smart] = features

  return (
    <section className="flex flex-col justify-center py-24 md:h-[80vh] md:py-[unset]">
      <div
        className="
      m-auto grid w-full max-w-screen-xl grid-cols-1 grid-rows-[auto_auto_auto_1fr] justify-center justify-items-center gap-x-8
      gap-y-4 p-6
      md:grid-cols-3
    "
      >
        <h1
          className="col-span-1 w-full pb-10 text-left text-6xl text-theme
      scroll-anim-fall md:col-span-3
      "
        >
          <Combine className="inline h-12" size={36} /> Complex where you need
          it
        </h1>
        <Feature
          alt={connected.alt}
          description={connected.description}
          image={connected.image}
          title={connected.title}
        />
        <Feature
          alt={social.alt}
          description={social.description}
          image={social.image}
          title={social.title}
        />
        <Feature
          alt={smart.alt}
          description={smart.description}
          image={smart.image}
          title={smart.title}
        />
      </div>
    </section>
  )
}
