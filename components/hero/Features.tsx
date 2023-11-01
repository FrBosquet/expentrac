import { Cable, Combine, Send, Users } from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    title: <><Cable className='inline' /> Connected</>,
    description: 'Expentrac provides you with the ability to associate each of your expenses with their respective providers. This means you can easily track where you\'re making payments and where you\'ve made purchases',
    image: '/screenshots/providers.png',
    alt: 'provider connections'
  },

  {
    title: <><Users className='inline' /> Social</>,
    description: 'Expentrac goes beyond individual finance management. With our app, you can effortlessly share your expenses with friends or family members. Whether you\'re splitting bills, managing joint finances, or simply keeping each other in the loop, our easy-to-use sharing feature allows you to collaborate seamlessly. ',
    image: '/screenshots/providers.png',
    alt: 'payment sharing'
  },
  {
    title: <><Send className='inline' /> Smart</>,
    description: 'Set up email notifications for payments to yourself or anyone else, ensuring you stay ahead of your financial commitments. Whether it\'s a reminder for your own expenses or to help someone else, our email notification feature keeps you organized and financially prepared',
    image: '/screenshots/providers.png',
    alt: 'email notifications'
  }
]

export const Feature = ({ title, description, image, alt }: {
  title: string | JSX.Element
  description: string | JSX.Element
  image: string
  alt: string
}) => {
  return <>
    <Image src={image} alt={alt} width={300} height={300} className='hidden md:block shadow-lg row-start-2 rounded-full scroll-anim-rise' />
    <h3 className='text-theme-accent text-4xl uppercase tracking-wider text-center scroll-anim-rise md:row-start-3 whitespace-nowrap'>{title}</h3>
    <p className='text-slate-300 text-center scroll-anim-rise md:row-start-4'>{description}</p>
  </>
}

export const Features = () => {
  const [connected, social, smart] = features

  return <section className='py-24 md:py-[unset] md:h-[80vh] flex flex-col justify-center'>
    <div className='
      gap-x-8 gap-y-4 max-w-screen-xl w-full p-6 m-auto grid justify-center justify-items-center
      grid-cols-1 md:grid-cols-3
      grid-rows-[auto_auto_auto_1fr]
    '>
      <h1 className='text-6xl text-theme pb-10 w-full text-left scroll-anim-fall
      col-span-1 md:col-span-3
      '><Combine size={36} className='inline h-12' /> Complex where you need it</h1>
      <Feature title={connected.title} description={connected.description} image={connected.image} alt={connected.alt} />
      <Feature title={social.title} description={social.description} image={social.image} alt={social.alt} />
      <Feature title={smart.title} description={smart.description} image={smart.image} alt={smart.alt} />
    </div>
  </section >
}
