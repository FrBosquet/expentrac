import { Forecast } from '@components/dashboard/forecast'
import { Month } from '@components/dashboard/month'
import { Summary } from '@components/dashboard/summary'
import { Today } from '@components/dashboard/today'
import { Header } from '@components/header'

export default async function Page() {
  return (
    <section className="flex-1 w-screen max-w-3xl xl:max-w-6xl p-6 mx-auto grid grid-cols-2 xl:grid-cols-4 gap-1 auto-rows-min">
      <Header className='col-span-2 xl:col-span-4' />
      <Summary className='col-span-2 xl:col-span-4' />
      <Month className='col-span-2 lg:col-span-1' />
      <Forecast className='col-span-2 xl:col-span-3' />
      <Today className='col-span-2 row-start-6 md:row-start-3 xl:row-start-auto lg:col-span-1' />
    </section>
  )
}
