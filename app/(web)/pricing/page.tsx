import { SignInRegular } from '@components/hero/signin'
import { CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { SectionTitle } from '@components/web/SectionTitle'

export default function Blog() {
  return (
    <section className="relative m-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-12 p-12 md:p-0">
      <SectionTitle>pricing</SectionTitle>
      <div className="relative w-96 max-w-[80vw] rounded-3xl border-2 border-slate-300 bg-slate-900 text-slate-300 shadow-bloom-md">
        <CardHeader>
          <CardTitle className="p-4 text-center text-2xl uppercase tracking-widest text-secondary">
            Alpha
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-10">
          <h2 className="w-full max-w-full whitespace-break-spaces border-b pb-8 text-center text-6xl font-bold text-primary-300">
            0,00 € /mo
          </h2>
          <p className="text-center text-slate-100">Everything included</p>
          <ul>
            <li>✅ Unlimited track of loans and subscriptions</li>
            <li>✅ Unlimited providers</li>
            <li>✅ Unlimited notifications</li>
            <li>✅ Unlimited providers</li>
            <li>✅ Share loans and subscriptions</li>
            <li>✅ Get payment forecasts</li>
            <li>✅ All new features that may appear in the future</li>
          </ul>
          <SignInRegular className="w-full" />
        </CardContent>
      </div>
      <p className="max-w-lg text-center text-slate-300">
        Expentrac is in alpha. You can take this opportunity and create your
        account now to take advantage of everything that may come in the future,
        for free.
      </p>
    </section>
  )
}
