import LoanShareEmail from '@emails/loan-share'
import WelcomeEmail from '@emails/welcome'
import { getLoanExtendedInformation } from '@lib/loan'
import { type LoanComplete } from '@types'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_KEY)

const sendWelcome = async (email: string, username: string) => {
  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email,
    subject: 'Welcome to Expentrac',
    react: <WelcomeEmail username={username} />
  })
}

const sendLoanShare = async (email: string, username: string, loan: LoanComplete) => {
  const { paymentsLeft } = getLoanExtendedInformation(loan)
  const { user: { name: sharer }, fee, name } = loan

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email,
    subject: `${name} wants to share a loan with you`,
    react: <LoanShareEmail username={username} sharer={sharer as string} loanAmount={fee} loanName={name} months={paymentsLeft} />
  })
}

export const emailSdk = {
  sendWelcome,
  sendLoanShare
}
