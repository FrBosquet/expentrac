import { PERIODICITY, contractMonthsPassed, getContractStatus, getOngoingPeriod } from '@lib/dates'
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
      const updatingSubs: Subscription[] = []

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
        const { contract } = sub

        const refPeriod = getOngoingPeriod(contract, refDate)

        if (!refPeriod) return

        const isYearly = refPeriod.periodicity === PERIODICITY.YEARLY

        const {
          ongoing,
          starts,
          ends,
          updates
        } = getContractStatus(contract, refDate)

        if (ongoing) {
          if (isYearly) {
            if (refPeriod.paymonth !== refDate.getMonth()) {
              return
            } else {
              yearlySubs.push(sub)
            }
          }

          activeSubs.push(sub)

          let shouldPay = true

          if (starts) {
            startingSubs.push(sub)

            if (refPeriod.payday! < refDate.getDate()) shouldPay = false
          }
          if (ends) {
            finishingSubs.push(sub)

            if (refPeriod.payday! > refDate.getDate()) shouldPay = false
          }
          if (updates) updatingSubs.push(sub)

          if (shouldPay) {
            monthlySubPay += refPeriod.fee
            monthlySubHolderFee += refPeriod.fee
          }
        }
      })

      loans.forEach(loan => {
        const { contract, fee, amount } = loan

        const {
          ongoing,
          starts,
          ends
        } = getContractStatus(contract, refDate)

        if (ongoing || starts || ends) {
          activeLoans.push(loan)

          if (starts) startingLoans.push(loan)
          if (ends) finishingLoans.push(loan)

          monthlyLoanPay += starts ? fee.initial : fee.monthly
          monthlyLoanHolderFee += ends ? fee.holderInitial : fee.holderMonthly

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
