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
import { type Prisma, prisma } from '@lib/prisma'
import { render } from '@react-email/render'

import { unwrapSub } from './sub'

type EmailMessage = {
  from: string
  to: string
  subject: string
  react: React.ReactElement
}
async function enqueue(
  message: EmailMessage,
  db: Prisma.TransactionClient,
  key?: string
) {
  const html = await render(message.react)
  return db.emailOutbox.create({
    data: { id: key, to: message.to, subject: message.subject, html }
  })
}

const sendWelcome = async (
  email: string,
  username: string,
  db: Prisma.TransactionClient = prisma,
  key?: string
) => {
  return enqueue(
    {
      from: 'Fran from Expentrac <info@expentrac.app>',
      to: email,
      subject: 'Welcome to Expentrac',
      react: <WelcomeEmail username={username} />
    },
    db,
    key
  )
}

// LOAN SHARE
const sendLoanShare = async (
  email: string,
  username: string,
  contact: Contract,
  db: Prisma.TransactionClient = prisma,
  key?: string
) => {
  const {
    payments: { left },
    fee: { monthly },
    user,
    name
  } = unwrapLoan(contact)

  return enqueue(
    {
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
    },
    db,
    key
  )
}

const sendLoanShareAcceptance = async (
  username: string,
  contract: Contract,
  db: Prisma.TransactionClient = prisma,
  key?: string
) => {
  const {
    user: { name: sharer, email },
    name
  } = contract

  return enqueue(
    {
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
    },
    db,
    key
  )
}

const sendLoanShareRejection = async (
  username: string,
  contract: Contract,
  db: Prisma.TransactionClient = prisma,
  key?: string
) => {
  const {
    user: { name: sharer, email },
    name
  } = contract

  return enqueue(
    {
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
    },
    db,
    key
  )
}

// SUB SHARE
const sendSubShare = async (
  email: string,
  username: string,
  contract: Contract,
  db: Prisma.TransactionClient = prisma,
  key?: string
) => {
  const {
    user: { name: sharer },
    fee: { monthly },
    name
  } = unwrapSub(contract)

  return enqueue(
    {
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
    },
    db,
    key
  )
}

const sendSubShareAcceptance = async (
  username: string,
  contract: Contract,
  db: Prisma.TransactionClient = prisma,
  key?: string
) => {
  const {
    user: { name: sharer, email },
    name
  } = contract

  return enqueue(
    {
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
    },
    db,
    key
  )
}

const sendSubShareRejection = async (
  username: string,
  contract: Contract,
  db: Prisma.TransactionClient = prisma,
  key?: string
) => {
  const {
    user: { name: sharer, email },
    name
  } = contract

  return enqueue(
    {
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
    },
    db,
    key
  )
}

// GENERIC
const sendGenericEmail = async (
  direction: string,
  username: string,
  message: string,
  db: Prisma.TransactionClient = prisma,
  key?: string
) => {
  return enqueue(
    {
      from: 'Fran from Expentrac <info@expentrac.app>',
      to: direction,
      subject: 'Notification from Expentrac',
      react: <GenericEmail message={message} username={username} />
    },
    db,
    key
  )
}

// DAILY
const sendDailyEmail = async (
  direction: string,
  username: string,
  loans: Contract[],
  subs: Contract[],
  db: Prisma.TransactionClient = prisma,
  key?: string
) => {
  const loansData = loans.map((loan) => unwrapLoan(loan))
  const subData = subs.map((sub) => unwrapSub(sub))
  const totalAmount =
    loansData.reduce((sum, l) => sum + l.fee.holder, 0) +
    subData.reduce((sum, s) => sum + s.fee.holder, 0)
  const names = [...loansData.map((l) => l.name), ...subData.map((s) => s.name)]
  const subject =
    names.length > 0
      ? `${euroFormatter.format(totalAmount)} today: ${names.join(', ')}`
      : 'Your payments for today'

  return enqueue(
    {
      from: 'Fran from Expentrac <info@expentrac.app>',
      to: direction,
      subject,
      react: (
        <DailyEmail
          loans={loans}
          preview={subject}
          subs={subs}
          username={username}
        />
      )
    },
    db,
    key
  )
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
