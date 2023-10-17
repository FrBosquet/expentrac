import { unwrapLoan } from '@lib/loan'
import { type RawLoan } from '@types'
import { type StateCreator } from 'zustand'

export interface LoanSlice {
  loans: RawLoan[]
  setLoans: (loans: RawLoan[]) => void
  addLoan: (loan: RawLoan) => void
  updateLoan: (loan: RawLoan) => void
  removeLoan: (loan: RawLoan) => void
}

export const createLoanSlice: StateCreator<LoanSlice> = (set) => ({
  loans: [],
  setLoans: (rawLoans: RawLoan[]) => {
    set({ loans: rawLoans })
  },
  addLoan: (loan: RawLoan) => {
    set(state => ({
      loans: [...state.loans, loan].sort((a, b) => {
        if (a.startDate === b.startDate) return a.name.localeCompare(b.name)
        return a.startDate > b.startDate ? -1 : 1
      })
    }))
  },
  updateLoan: (loan: RawLoan) => {
    set(state => ({
      loans: state.loans.map(l => l.id === loan.id ? loan : l)
    }))
  },
  removeLoan: (loan: RawLoan) => {
    set(state => ({
      loans: state.loans.filter(l => l.id !== loan.id)
    }))
  }
})

export const getLoansSetter = (state: LoanSlice) => state.setLoans

export const getLoans = (refDate: Date) => (state: LoanSlice) => {
  const { loans } = state

  return loans.map(loan => unwrapLoan(loan, refDate))
}

export const getLoan = (refDate: Date, id: string) => (state: LoanSlice) => {
  const { loans } = state

  const loan = loans.find(loan => loan.id === id)

  if (!loan) throw new Error(`Loan with id ${id} not found`)

  return unwrapLoan(loan, refDate)
}
