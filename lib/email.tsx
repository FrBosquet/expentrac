import {
  DailyEmail,
  GenericEmail,
  LoanShareAcceptEmail,
  LoanShareEmail,
  LoanShareRejectEmail,
  SubShareAcceptEmail,
  SubShareEmail,
  SubShareRejectEmail,
  WelcomeEmail
} from '@emails'
import { euroFormatter } from '@lib/currency'
import { unwrapLoan } from '@lib/loan'
import { type Contract } from '@lib/prisma'
import { Resend } from 'resend'

import { unwrapSub } from './sub'

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
const sendLoanShare = async (
  email: string,
  username: string,
  contact: Contract
) => {
  const {
    payments: { left },
    fee: { monthly },
    user,
    name
  } = unwrapLoan(contact)

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email,
    subject: `${user.name} wants to share a loan with you`,
    react: (
      <LoanShareEmail
        loanAmount={monthly}
        loanName={name}
        months={left}
        sharer={user.name!}
        username={username}
      />
    )
  })
}

const sendLoanShareAcceptance = async (
  username: string,
  contract: Contract
) => {
  const {
    user: { name: sharer, email },
    name
  } = contract

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email!,
    subject: `${username} accepted to share a loan with you`,
    react: (
      <LoanShareAcceptEmail
        loanName={name}
        shareHolder={username}
        username={sharer!}
      />
    )
  })
}

const sendLoanShareRejection = async (username: string, contract: Contract) => {
  const {
    user: { name: sharer, email },
    name
  } = contract

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email!,
    subject: `${username} refused to share a loan with you`,
    react: (
      <LoanShareRejectEmail
        loanName={name}
        shareHolder={username}
        username={sharer!}
      />
    )
  })
}

// SUB SHARE
const sendSubShare = async (
  email: string,
  username: string,
  contract: Contract
) => {
  const {
    user: { name: sharer },
    fee: { monthly },
    name
  } = unwrapSub(contract)

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email,
    subject: `${sharer} wants to share a subscription with you`,
    react: (
      <SubShareEmail
        sharer={sharer!}
        subAmount={monthly}
        subName={name}
        username={username}
      />
    )
  })
}

const sendSubShareAcceptance = async (username: string, contract: Contract) => {
  const {
    user: { name: sharer, email },
    name
  } = contract

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email!,
    subject: `${username} accepted to share a subscription with you`,
    react: (
      <SubShareAcceptEmail
        shareHolder={username}
        subName={name}
        username={sharer!}
      />
    )
  })
}

const sendSubShareRejection = async (username: string, contract: Contract) => {
  const {
    user: { name: sharer, email },
    name
  } = contract

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email!,
    subject: `${username} refused to share a subscription with you`,
    react: (
      <SubShareRejectEmail
        shareHolder={username}
        subName={name}
        username={sharer!}
      />
    )
  })
}

// GENERIC
const sendGenericEmail = async (
  direction: string,
  username: string,
  message: string
) => {
  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: direction,
    subject: 'Notification from Expentrac',
    react: <GenericEmail message={message} username={username} />
  })
}

// DAILY
const sendDailyEmail = async (
  direction: string,
  username: string,
  loans: Contract[],
  subs: Contract[]
) => {
  const loansData = loans.map((loan) => unwrapLoan(loan))
  const subData = subs.map((sub) => unwrapSub(sub))
  const totalAmount =
    loansData.reduce((sum, l) => sum + l.fee.holder, 0) +
    subData.reduce((sum, s) => sum + s.fee.holder, 0)
  const names = [
    ...loansData.map((l) => l.name),
    ...subData.map((s) => s.name)
  ]
  const subject =
    names.length > 0
      ? `${euroFormatter.format(totalAmount)} today: ${names.join(', ')}`
      : 'Your payments for today'

  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: direction,
    subject,
    react: (
      <DailyEmail
        loans={loans}
        subs={subs}
        username={username}
        preview={subject}
      />
    )
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
  sendSubShareRejection,
  sendGenericEmail,
  sendDailyEmail
}
