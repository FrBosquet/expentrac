import { Forecast } from '@components/dashboard/forecast'
import { Latest } from '@components/dashboard/latest'
import { Month } from '@components/dashboard/month'
import { Summary } from '@components/dashboard/summary'
import { Today } from '@components/dashboard/today'
import { Header } from '@components/header'

export default async function Page() {
  return (
    <>
      <Header />
      <Summary className='col-span-2 xl:col-span-4' />
      <Month className='col-span-2 lg:col-span-1' />
      <Forecast className='col-span-2 xl:col-span-3' />
      <Today className='col-span-2 row-start-6 md:row-start-3 xl:row-start-auto lg:col-span-1' />
      <Latest className='col-span-2 xl:col-span-3' />
    </>
  )
}
