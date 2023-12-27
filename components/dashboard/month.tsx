'use client'

import { useSummary } from '@components/Summary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Progress } from '@components/ui/progress'
import { euroFormatter } from '@lib/currency'
import { twMerge } from 'tailwind-merge'

interface Props {
  className?: string
}

export const Month = ({ className }: Props) => {
  const {
    totalFee,
    alreadyPaidFee
  } = useSummary()

  const percentage = (alreadyPaidFee / totalFee) * 100

  const date = new Date().toLocaleDateString('default', { month: 'long', day: 'numeric' })

  return <Card className={twMerge('flex flex-col', className)}>
    <CardHeader>
      <CardTitle>This month</CardTitle>
      <CardDescription>How it is going?</CardDescription>
    </CardHeader>
    <CardContent>
      <div className='flex flex-col gap-3 text-center'>
        <p className='text-sm text-theme-light'>{date}</p>
        <p className='text-2xl font-semibold text-expentrac-800'>{euroFormatter.format(alreadyPaidFee)}/<br />{euroFormatter.format(totalFee)}</p>
        <Progress value={percentage} />
        <p className='text-sm text-theme-light'>You already paid {percentage.toFixed(0)}% or your monthly fees</p>
        <p className='text-sm text-theme-accent'>{euroFormatter.format(totalFee - alreadyPaidFee)} left</p>
      </div>
    </CardContent>
  </Card>
}
