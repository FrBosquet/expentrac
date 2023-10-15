'use client'

import { useUser } from '@components/Provider'
import { useSummary } from '@components/Summary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { Coins, HelpingHand, Receipt, Tv, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Grid from 'public/grid.png'
import Money from 'public/money.png'
import { twMerge } from 'tailwind-merge'

const ConceptCard = ({ value, label, Icon, className, hidden }: { value: string, label: string, Icon: LucideIcon, className?: string, hidden?: boolean }) => {
  if (hidden) return null

  return <Card className={twMerge('animate-fall-short', className)}>
    <CardHeader className='flex flex-col items-center gap-2'>
      <Icon />
      <CardTitle className='break-words text-center'>{value}</CardTitle>
    </CardHeader>
    <CardContent className='text-xs text-theme-light text-center'>
      {label}
    </CardContent>
  </Card>
}

interface Props {
  className?: string
}

export const Summary = ({ className }: Props) => {
  const { user, loading } = useUser()
  const {
    owedMoney,
    totalFee,
    loanFee,
    loanCount,
    subFee,
    subCount
  } = useSummary()

  const renderCards = (className: string) => {
    return <>
      <ConceptCard className={className} hidden={owedMoney === 0} value={euroFormatter.format(owedMoney)} label="Total owed money" Icon={Coins} />
      <ConceptCard className={className} hidden={totalFee === 0} value={euroFormatter.format(totalFee)} label="Total monthly payments" Icon={Receipt} />
      <ConceptCard className={className} hidden={loanCount === 0} value={euroFormatter.format(loanFee)} label={`Total monthly loan payments, from ${loanCount} loans`} Icon={HelpingHand} />
      <ConceptCard className={className} hidden={subCount === 0} value={euroFormatter.format(subFee)} label={`Total monthly subscription payments, from ${subCount} subscriptions`} Icon={Tv} />
    </>
  }

  return <><Card className={twMerge('bg-gradient-to-l from-expentrac-800 to-background relative', className)}>
    <CardHeader className='relative z-20 py-8'>
      <CardTitle className='text-5xl'>{loading ? '...' : `Hello ${user.name}`}</CardTitle>
      <CardDescription>Whats going on with your money?</CardDescription>
    </CardHeader>
    <CardContent className='relative z-20'>
      <div className='grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2'>
        {renderCards('hidden md:block')}
      </div>
    </CardContent>
    <Image src={Grid} alt="grid layout" className='absolute top-0 h-full w-full opacity-20 object-cover' />
    <div className='absolute inset-0 overflow-hidden flex justify-end'>
      <Image src={Money} alt="Expenses graphics" height={400} width={400} className='hidden md:block object-contain hue-rotate-180 w-[45%] xl:w-auto' />
    </div>
  </Card>
    {renderCards('md:hidden block')}
  </>
}
