import { useLoanShares } from '@components/loan-share/Context'
import { type LoanShareComplete } from '@types'

export enum NOTIFICATION_TYPE {
  LOAN_SHARES = 'LOAN_SHARES',
}

export interface Notification {
  type: NOTIFICATION_TYPE.LOAN_SHARES
  meta: LoanShareComplete
}

export const useNotifications = () => {
  const { loanShares } = useLoanShares()

  const notifications = [
    ...loanShares.filter((loanShare) => loanShare.accepted == null).map((loanShare) => ({
      type: NOTIFICATION_TYPE.LOAN_SHARES,
      meta: loanShare
    }))
  ]

  return {
    notifications
  }
}
