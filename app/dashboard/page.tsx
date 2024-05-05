import { Forecast } from '@components/dashboard/forecast'
import { Latest } from '@components/dashboard/latest'
import { Month } from '@components/dashboard/month'
import { UserPayplan } from '@components/dashboard/payplan'
import { Summary } from '@components/dashboard/summary'
import { Today } from '@components/dashboard/today'

export default async function Page() {
  return (
    <>
      <Summary className='col-span-2 xl:col-span-4' />
      <Month className='col-span-2 xl:col-span-1' />
      <Forecast className='col-span-2 xl:col-span-3' />
      <Today className='col-span-2 xl:col-span-1' />
      <Latest className='col-span-2 xl:col-span-3' />
      <UserPayplan className='col-span-2 xl:col-span-4' />
    </>
  )
}
