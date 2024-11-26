'use client'
import { useDate } from '@components/date/context'
import { useLoans } from '@components/loan/context'
import { useMonthPayplan } from '@components/payplan/use-month-payplan'
import { useSubs } from '@components/subscription/context'
import { Tooltip } from '@components/Tooltip'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/ui/card'
import { useUser } from '@components/user/hooks'
import { euroFormatter } from '@lib/currency'
import NumberFlow from '@number-flow/react'
import {
  Coins,
  HelpingHand,
  type LucideIcon,
  Receipt,
  Tv,
  User
} from 'lucide-react'
import Image from 'next/image'
import { type ReactNode, useLayoutEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import Grid from '@/public/grid.png'
import Money from '@/public/money.png'

const ConceptCard = ({
  value: realValue,
  label,
  Icon,
  className,
  hidden,
  tooltip
}: {
  value: number
  label: string
  Icon: LucideIcon
  className?: string
  hidden?: boolean
  tooltip?: ReactNode
}) => {
  const [value, setValue] = useState(0)

  useLayoutEffect(() => {
    if (value !== realValue) {
      setTimeout(() => setValue(realValue), 300)
    }
  }, [realValue, value])

  if (hidden) return null

  return (
    <Tooltip side="bottom" tooltip={tooltip ?? label}>
      <Card className={twMerge('animate-fall-short h-full', className)}>
        <CardHeader className="flex flex-col items-center gap-2">
          <Icon />
          <CardTitle className="break-words text-center">
            <NumberFlow
              format={{
                style: 'currency',
                currency: 'EUR'
              }}
              spinTiming={{ duration: 750 }}
              transformTiming={{ duration: 750 }}
              trend={1}
              value={value}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-xs text-theme-light">
          {label}
        </CardContent>
      </Card>
    </Tooltip>
  )
}

interface Props {
  className?: string
}

const Cards = ({ className }: { className: string }) => {
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

  const owedTooltip = (
    <aside className="flex  flex-col gap-2 pb-4 text-xs">
      <h3 className="flex gap-2 text-theme-light">
        <Coins size={12} /> Total money owed:
      </h3>
      <p className="font-semibold">{euroFormatter.format(owed)}</p>
      <h3 className="flex gap-2 text-theme-light">
        <User size={12} /> You owe:
      </h3>
      <p className="font-semibold">{euroFormatter.format(holderOwed)}</p>
    </aside>
  )

  const totalTooltip = (
    <aside className="flex  flex-col gap-2 pb-4 text-xs">
      <h3 className="flex gap-2 text-theme-light">
        <Coins size={12} /> Total monthly payment:
      </h3>
      <p className="font-semibold">{euroFormatter.format(monthlyPay)}</p>
      <h3 className="flex gap-2 text-theme-light">
        <User size={12} /> You pay:
      </h3>
      <p className="font-semibold">{euroFormatter.format(monthlyHolderFee)}</p>
    </aside>
  )

  const loanTooltip = (
    <aside className="flex  flex-col gap-2 pb-4 text-xs">
      <h3 className="flex gap-2 text-theme-light">
        <Coins size={12} /> Total loan monthly payment:
      </h3>
      <p className="font-semibold">{euroFormatter.format(monthlyLoanPay)}</p>
      <h3 className="flex gap-2 text-theme-light">
        <User size={12} /> You pay:
      </h3>
      <p className="font-semibold">
        {euroFormatter.format(monthlyLoanHolderFee)}
      </p>
    </aside>
  )

  const subTooltip = (
    <aside className="flex  flex-col gap-2 pb-4 text-xs">
      <h3 className="flex gap-2 text-theme-light">
        <Coins size={12} /> Total subs monthly payment:
      </h3>
      <p className="font-semibold">{euroFormatter.format(monthlySubPay)}</p>
      <h3 className="flex gap-2 text-theme-light">
        <User size={12} /> You pay:
      </h3>
      <p className="font-semibold">
        {euroFormatter.format(monthlySubHolderFee)}
      </p>
    </aside>
  )

  return (
    <>
      <ConceptCard
        className={className}
        hidden={holderOwed === 0}
        Icon={Coins}
        label="Total owed money"
        tooltip={owedTooltip}
        value={holderOwed}
      />
      <ConceptCard
        className={className}
        hidden={monthlyHolderFee === 0}
        Icon={Receipt}
        label="Total monthly payments"
        tooltip={totalTooltip}
        value={monthlyHolderFee}
      />
      <ConceptCard
        className={className}
        hidden={loanCount === 0}
        Icon={HelpingHand}
        label={`Total monthly loan payments, from ${loanCount} loans`}
        tooltip={loanTooltip}
        value={monthlyLoanHolderFee}
      />
      <ConceptCard
        className={className}
        hidden={subCount === 0}
        Icon={Tv}
        label={`Total monthly subscription payments, from ${subCount} subscriptions`}
        tooltip={subTooltip}
        value={monthlySubHolderFee}
      />
    </>
  )
}

export const Summary = ({ className }: Props) => {
  const { user, loading } = useUser()

  return (
    <>
      <Card
        className={twMerge(
          'bg-gradient-to-l from-expentrac-800 to-background relative',
          className
        )}
      >
        <CardHeader className="relative z-20 py-8">
          <CardTitle className="text-5xl">
            {loading ? '...' : `Hello ${user.name}`}
          </CardTitle>
          <CardDescription>Whats going on with your money?</CardDescription>
        </CardHeader>
        <CardContent className="relative z-20">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-5">
            <Cards className="hidden md:block" />
          </div>
        </CardContent>
        <Image
          alt="grid layout"
          className="absolute top-0 size-full object-cover opacity-20"
          src={Grid}
        />
        <div className="absolute inset-0 flex justify-end overflow-hidden">
          <Image
            alt="Expenses graphics"
            className="hidden w-[45%] object-contain hue-rotate-180 md:block xl:w-auto"
            height={400}
            src={Money}
            width={400}
          />
        </div>
      </Card>
      <Cards className="block md:hidden" />
    </>
  )
}
