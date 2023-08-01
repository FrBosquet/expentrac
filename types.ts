export type LoanExtendedInfo = {
  totalAmount: number;
  paidAmount: number;
  owedAmount: number;

  payments: number;
  paymentsDone: number;
  paymentsLeft: number;
}