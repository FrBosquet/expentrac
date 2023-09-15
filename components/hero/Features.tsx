import { Cable, Send, Users } from 'lucide-react'
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

export const Features = () => {
  return <section className='h-[75vh] flex justify-center'>
    <div className='gap-x-8 gap-y-4 max-w-screen-xl w-full p-6 m-auto grid grid-cols-3 grid-rows-[auto_auto_1fr] justify-center justify-items-center'>
      {
        features.map(({ title, description, image, alt }) => {
          return <>
            <Image src={image} alt={alt} width={300} height={300} className='shadow-lg row-start-1 rounded-full' />
            <h3 className='text-secondary row-start-2 text-4xl uppercase tracking-wider text-center'>{title}</h3>
            <p className='row-start-3 text-slate-300 text-center'>{description}</p>
          </>
        })
      }
    </div>
  </section >
}
