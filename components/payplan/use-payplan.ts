import { contractMonthsPassed, getContractTime } from '@lib/dates'
import { type Loan } from '@lib/loan'
import { type Subscription } from '@lib/sub'
import { useMemo } from 'react'

export const usePayplan = (date: Date, {
  loans = [],
  subs = []
}: {
  loans?: Loan[]
  subs?: Subscription[]
}) => {
  const payplan = useMemo(() => {
    return new Array(12).fill(null).map((_, index) => {
      const refDate = new Date(date)
      refDate.setMonth(refDate.getMonth() + index)

      const startingSubs: Subscription[] = []
      const finishingSubs: Subscription[] = []
      const activeSubs: Subscription[] = []

      const startingLoans: Loan[] = []
      const finishingLoans: Loan[] = []
      const activeLoans: Loan[] = []

      let monthlyPay: number = 0
      let monthlyHolderFee: number = 0
      let owed = 0

      subs.forEach(sub => {
        const { contract, fee } = sub

        const {
          isOngoing,
          startsThisMonth,
          endsThisMonth
        } = getContractTime(contract, refDate)

        if (isOngoing || startsThisMonth || endsThisMonth) {
          activeSubs.push(sub)

          if (startsThisMonth) startingSubs.push(sub)
          if (endsThisMonth) finishingSubs.push(sub)

          monthlyPay += fee.monthly
          monthlyHolderFee += fee.holderMonthly

          owed += 0
        }
      })

      loans.forEach(loan => {
        const { contract, fee, amount } = loan
        const {
          isOngoing,
          startsThisMonth,
          endsThisMonth
        } = getContractTime(contract, refDate)

        if (isOngoing || startsThisMonth || endsThisMonth) {
          activeLoans.push(loan)

          if (startsThisMonth) startingLoans.push(loan)
          if (endsThisMonth) finishingLoans.push(loan)

          monthlyPay += startsThisMonth ? fee.initial : fee.monthly
          monthlyHolderFee += startsThisMonth ? fee.holderInitial : fee.holderMonthly

          owed += amount.total - fee.initial - fee.monthly * contractMonthsPassed(contract, refDate)
        }
      })

      const hasStartingSubs = startingSubs.length > 0
      const hasFinishingSubs = finishingSubs.length > 0
      const hasSharedSubs = activeSubs.some(loan => loan.shares.isShared)

      const hasStartingLoans = startingLoans.length > 0
      const hasFinishingLoans = finishingLoans.length > 0
      const hasSharedLoans = activeLoans.some(loan => loan.shares.isShared)

      return {
        loans: activeLoans,
        startingLoans,
        finishingLoans,
        subs: activeSubs,
        startingSubs,
        finishingSubs,
        date: refDate,
        monthlyPay,
        monthlyHolderFee,
        owed,
        hasStartingSubs,
        hasFinishingSubs,
        hasSharedSubs,
        hasStartingLoans,
        hasFinishingLoans,
        hasSharedLoans
      }
    })
  }, [subs, loans, date])

  return payplan
}
