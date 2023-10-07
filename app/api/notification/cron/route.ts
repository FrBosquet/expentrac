import { type Loan, type Subscription, type User } from '@prisma/client'
import { emailSdk } from '@services/email'
import { prisma } from '@services/prisma'
import { type LoanComplete } from '@types'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date().getDate()

  const users: Record<string, User & { loans: Loan[], subs: Subscription[] }> = {}

  // loans
  const loans = await prisma.$queryRaw<LoanComplete[]>`
    SELECT l.*, to_json(u) "user"
    FROM "Loan" l 
    INNER JOIN "User" u ON l."userId" = u.id
    WHERE date_part('day', l."startDate") = ${date} AND l."endDate" > CURRENT_DATE;
  `
  loans.forEach(loan => {
    const { userId } = loan
    if (!users[userId]) {
      users[userId] = { ...loan.user, loans: [], subs: [] }
    }

    users[userId].loans.push(loan)
  })

  // subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: {
      payday: date
    },
    include: {
      user: true,
      shares: true
    }
  })

  subscriptions.forEach(subscription => {
    const { userId } = subscription
    if (!users[userId]) {
      users[userId] = { ...subscription.user, loans: [], subs: [] }
    }

    users[userId].subs.push(subscription)
  })

  // email
  await Promise.all(Object.keys(users).map(async userId => {
    const { loans, subs, name, email } = users[userId]

    // send email
    if (email) {
      await emailSdk.sendDailyEmail(email, name as string, loans, subs)
    }
  }))

  // done
  return NextResponse.json({
    message: 'Job finished',
    users
  }, {
    status: 200
  })
}