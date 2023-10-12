import { Forecast } from '@components/dashboard/forecast'
import { Summary } from '@components/dashboard/summary'
import { Header } from '@components/header'

export default async function Page() {
  return (
    <section className="flex-1 w-screen max-w-3xl xl:max-w-5xl p-6 mx-auto flex flex-col gap-1">
      <Header />
      <Summary />
      <Forecast />
    </section>
  )
}
