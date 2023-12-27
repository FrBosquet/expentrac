'use client'

import { Tooltip } from '@components/Tooltip'
import { useDate } from '@components/date/context'
import { useLoans } from '@components/loan/context'
import { useMonthPayplan } from '@components/payplan/use-month-payplan'
import { useSubs } from '@components/subscription/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { useUser } from '@components/user/hooks'
import { euroFormatter } from '@lib/currency'
import { Coins, HelpingHand, Receipt, Tv, User, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Grid from 'public/grid.png'
import Money from 'public/money.png'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

const ConceptCard = ({ value, label, Icon, className, hidden, tooltip }: { value: string, label: string, Icon: LucideIcon, className?: string, hidden?: boolean, tooltip?: ReactNode }) => {
  if (hidden) return null

  return <Tooltip side='bottom' tooltip={tooltip ?? label}>
    <Card className={twMerge('animate-fall-short h-full', className)}>
      <CardHeader className='flex flex-col items-center gap-2'>
        <Icon />
        <CardTitle className='break-words text-center'>{value}</CardTitle>
      </CardHeader>
      <CardContent className='text-xs text-theme-light text-center'>
        {label}
      </CardContent>
    </Card>
  </Tooltip>
}

interface Props {
  className?: string
}

const Cards = ({ className }: {
  className: string
}) => {
  const { subs } = useSubs()
  const { date } = useDate()
  const { loans } = useLoans()
  const payplan = useMonthPayplan(date, { subs, loans })
  const {
    owed,
    holderOwed,
    monthlyPay,
    monthlyHolderFee,
    monthlyLoanPay,
    monthlyLoanHolderFee,
    monthlySubPay,
    monthlySubHolderFee,
    loans: activeLoans,
    subs: activeSubs
  } = payplan

  const loanCount = activeLoans.length
  const subCount = activeSubs.length

  const owedTooltip = <aside className='pb-4 max-w-12 flex flex-col gap-2 text-xs'>
    <h3 className='text-theme-light flex gap-2'><Coins size={12} /> Total money owed:</h3>
    <p className='font-semibold'>{euroFormatter.format(owed)}</p>
    <h3 className='text-theme-light flex gap-2'><User size={12} /> You owe:</h3>
    <p className='font-semibold'>{euroFormatter.format(holderOwed)}</p>
  </aside>

  const totalTooltip = <aside className='pb-4 max-w-12 flex flex-col gap-2 text-xs'>
    <h3 className='text-theme-light flex gap-2'><Coins size={12} /> Total monthly payment:</h3>
    <p className='font-semibold'>{euroFormatter.format(monthlyPay)}</p>
    <h3 className='text-theme-light flex gap-2'><User size={12} /> You pay:</h3>
    <p className='font-semibold'>{euroFormatter.format(monthlyHolderFee)}</p>
  </aside>

  const loanTooltip = <aside className='pb-4 max-w-12 flex flex-col gap-2 text-xs'>
    <h3 className='text-theme-light flex gap-2'><Coins size={12} /> Total loan monthly payment:</h3>
    <p className='font-semibold'>{euroFormatter.format(monthlyLoanPay)}</p>
    <h3 className='text-theme-light flex gap-2'><User size={12} /> You pay:</h3>
    <p className='font-semibold'>{euroFormatter.format(monthlyLoanHolderFee)}</p>
  </aside>

  const subTooltip = <aside className='pb-4 max-w-12 flex flex-col gap-2 text-xs'>
    <h3 className='text-theme-light flex gap-2'><Coins size={12} /> Total subs monthly payment:</h3>
    <p className='font-semibold'>{euroFormatter.format(monthlySubPay)}</p>
    <h3 className='text-theme-light flex gap-2'><User size={12} /> You pay:</h3>
    <p className='font-semibold'>{euroFormatter.format(monthlySubHolderFee)}</p>
  </aside>

  return <>
    <ConceptCard
      className={className}
      hidden={holderOwed === 0}
      value={euroFormatter.format(holderOwed)}
      label="Total owed money"
      Icon={Coins}
      tooltip={owedTooltip} />
    <ConceptCard
      className={className}
      hidden={monthlyHolderFee === 0}
      value={euroFormatter.format(monthlyHolderFee)}
      label="Total monthly payments"
      Icon={Receipt}
      tooltip={totalTooltip} />
    <ConceptCard
      className={className}
      hidden={loanCount === 0}
      value={euroFormatter.format(monthlyLoanHolderFee)}
      label={`Total monthly loan payments, from ${loanCount} loans`} Icon={HelpingHand} tooltip={loanTooltip} />
    <ConceptCard
      className={className}
      hidden={subCount === 0}
      value={euroFormatter.format(monthlySubHolderFee)}
      label={`Total monthly subscription payments, from ${subCount} subscriptions`}
      Icon={Tv}
      tooltip={subTooltip} />
  </>
}

export const Summary = ({ className }: Props) => {
  const { user, loading } = useUser()

  return <>
    <Card className={twMerge('bg-gradient-to-l from-expentrac-800 to-background relative', className)}>
      <CardHeader className='relative z-20 py-8'>
        <CardTitle className='text-5xl'>{loading ? '...' : `Hello ${user.name}`}</CardTitle>
        <CardDescription>Whats going on with your money?</CardDescription>
      </CardHeader>
      <CardContent className='relative z-20'>
        <div className='grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2'>
          <Cards className='hidden md:block' />
        </div>
      </CardContent>
      <Image src={Grid} alt="grid layout" className='absolute top-0 h-full w-full opacity-20 object-cover' />
      <div className='absolute inset-0 overflow-hidden flex justify-end'>
        <Image src={Money} alt="Expenses graphics" height={400} width={400} className='hidden md:block object-contain hue-rotate-180 w-[45%] xl:w-auto' />
      </div>
    </Card>
    <Cards className='block md:hidden' />
  </>
}
