import { LoanShareAcceptEmail, LoanShareEmail, LoanShareRejectEmail, SubShareAcceptEmail, SubShareEmail, SubShareRejectEmail, WelcomeEmail } from '@emails'
import { getLoanExtendedInformation } from '@lib/loan'
import { type LoanComplete, type SubscriptionComplete } from '@types'

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

// LOAN SHARE
const sendLoanShare = async (email: string, username: string, loan: LoanComplete) => {
  const { paymentsLeft } = getLoanExtendedInformation(loan)
  const { user: { name: sharer }, fee, name } = loan

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email,
    subject: `${sharer} wants to share a loan with you`,
    react: <LoanShareEmail username={username} sharer={sharer as string} loanAmount={fee} loanName={name} months={paymentsLeft} />
  })
}

const sendLoanShareAcceptance = async (username: string, loan: LoanComplete) => {
  const { user: { name: sharer, email }, name } = loan

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email as string,
    subject: `${username} accepted to share a loan with you`,
    react: <LoanShareAcceptEmail username={sharer as string} shareHolder={username} loanName={name} />
  })
}

const sendLoanShareRejection = async (username: string, loan: LoanComplete) => {
  const { user: { name: sharer, email }, name } = loan

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email as string,
    subject: `${username} refused to share a loan with you`,
    react: <LoanShareRejectEmail username={sharer as string} shareHolder={username} loanName={name} />
  })
}

// SUB SHARE
const sendSubShare = async (email: string, username: string, sub: SubscriptionComplete) => {
  const { user: { name: sharer }, fee, name } = sub

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email,
    subject: `${username} wants to share a subscription with you`,
    react: <SubShareEmail username={username} sharer={sharer as string} subAmount={fee} subName={name} />
  })
}

const sendSubShareAcceptance = async (username: string, sub: SubscriptionComplete) => {
  const { user: { name: sharer, email }, name } = sub

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email as string,
    subject: `${username} accepted to share a subscription with you`,
    react: <SubShareAcceptEmail username={sharer as string} shareHolder={username} subName={name} />
  })
}

const sendSubShareRejection = async (username: string, sub: SubscriptionComplete) => {
  const { user: { name: sharer, email }, name } = sub

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email as string,
    subject: `${username} refused to share a subscription with you`,
    react: <SubShareRejectEmail username={sharer as string} shareHolder={username} subName={name} />
  })
}

// SDK
export const emailSdk = {
  sendWelcome,
  sendLoanShare,
  sendLoanShareAcceptance,
  sendLoanShareRejection,
  sendSubShare,
  sendSubShareAcceptance,
  sendSubShareRejection
}
