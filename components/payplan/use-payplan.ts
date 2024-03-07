import { PERIODICITY, contractMonthsPassed, getContractTime } from '@lib/dates'
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
      const yearlySubs: Subscription[] = []

      const startingLoans: Loan[] = []
      const finishingLoans: Loan[] = []
      const activeLoans: Loan[] = []

      let owed = 0
      let holderOwed = 0

      let monthlyLoanPay: number = 0
      let monthlyLoanHolderFee: number = 0

      let monthlySubPay: number = 0
      let monthlySubHolderFee: number = 0

      subs.forEach(sub => {
        const { contract, fee } = sub

        const refPeriod = contract.periods[0]
        const isYearly = refPeriod.periodicity === PERIODICITY.YEARLY

        const {
          isOngoing,
          startsThisMonth,
          endsThisMonth
        } = getContractTime(contract, refDate)

        if (isOngoing || startsThisMonth || endsThisMonth) {
          if (isYearly) {
            if (refPeriod.paymonth !== refDate.getMonth()) {
              return
            } else {
              yearlySubs.push(sub)
            }
          }

          activeSubs.push(sub)

          if (startsThisMonth) startingSubs.push(sub)
          if (endsThisMonth) finishingSubs.push(sub)

          monthlySubPay += isYearly ? fee.yearly : fee.monthly
          monthlySubHolderFee += isYearly ? fee.holderYearly : fee.holderMonthly
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

          monthlyLoanPay += startsThisMonth ? fee.initial : fee.monthly
          monthlyLoanHolderFee += startsThisMonth ? fee.holderInitial : fee.holderMonthly

          owed += amount.total - fee.initial - fee.monthly * contractMonthsPassed(contract, refDate)
          holderOwed += amount.holderTotal - fee.holderInitial - fee.holderMonthly * contractMonthsPassed(contract, refDate)
        }
      })

      const monthlyPay = monthlyLoanPay + monthlySubPay
      const monthlyHolderFee = monthlyLoanHolderFee + monthlySubHolderFee

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
        monthlyLoanPay,
        monthlyLoanHolderFee,
        monthlySubPay,
        monthlySubHolderFee,
        owed,
        holderOwed,
        hasStartingSubs,
        hasFinishingSubs,
        hasSharedSubs,
        hasStartingLoans,
        hasFinishingLoans,
        hasSharedLoans,
        yearlySubs
      }
    })
  }, [subs, loans, date])

  return payplan
}
