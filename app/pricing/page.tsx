import { RegularSignin } from '@components/hero/signin'
import { CardContent, CardHeader, CardTitle } from '@components/ui/card'

export default function Blog() {
  return <section className='flex flex-col gap-12 justify-center items-center'>
    <div className='bg-slate-900 rounded-3xl text-slate-300 w-[24rem] max-w-[80vw] border-2 border-slate-300 shadow-bloom-md relative'>
      <CardHeader>
        <CardTitle className='text-center tracking-widest uppercase text-secondary text-2xl p-4'>Alpha</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-start gap-10'>
        <h2 className='text-6xl pb-8 font-bold text-primary-300 border-b w-full text-center whitespace-break-spaces max-w-full'>0,00 € /mo</h2>
        <p className='text-slate-100 text-center'>Everything included</p>
        <ul>
          <li>✅ Unlimited track of loans and subscriptions</li>
          <li>✅ Unlimited providers</li>
          <li>✅ Unlimited notifications</li>
          <li>✅ Unlimited providers</li>
          <li>✅ Share loans and subscriptions</li>
          <li>✅ Get payment forecasts</li>
          <li>✅ All new features that may appear in the future</li>
        </ul>
        <RegularSignin className='w-full' />
      </CardContent>
    </div>
    <p className='text-slate-300 max-w-lg text-center'>Expentrac is in alpha. You can take this opportunity and create your account now to take advantage of everything that may come in the future, for free.</p>
  </section>
}
