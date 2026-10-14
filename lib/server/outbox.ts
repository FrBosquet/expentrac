import { prisma } from '@lib/prisma'
import { Resend } from 'resend'

// Resend deduplicates for 24h. Stop uncertain retries after 23h, rather than risk a second send.
const RETRY_WINDOW = 23 * 60 * 60 * 1000
const MAX_ATTEMPTS = 5

export async function deliverOutbox(id?: string) {
  const deadline = Date.now() + 45_000
  const now = new Date()
  const jobs = await prisma.emailOutbox.findMany({
    where: {
      id,
      status: { in: ['pending', 'sending'] },
      nextAttemptAt: { lte: now },
      OR: [{ leaseUntil: null }, { leaseUntil: { lt: now } }]
    },
    orderBy: { createdAt: 'asc' },
    take: 50
  })
  const metrics = { sent: 0, failed: 0, pending: 0 }
  const resend = new Resend(process.env.RESEND_KEY)
  // Sequential delivery bounds connections and external API concurrency.
  for (const job of jobs) {
    if (Date.now() >= deadline) {
      metrics.pending++
      continue
    }
    const claim = await prisma.emailOutbox.updateMany({
      where: {
        id: job.id,
        status: { in: ['pending', 'sending'] },
        OR: [{ leaseUntil: null }, { leaseUntil: { lt: now } }]
      },
      data: {
        status: 'sending',
        leaseUntil: new Date(Date.now() + 60_000),
        attempts: { increment: 1 },
        firstAttemptAt: job.firstAttemptAt ?? now
      }
    })
    if (!claim.count) continue
    if (
      job.attempts >= MAX_ATTEMPTS ||
      (job.firstAttemptAt &&
        now.getTime() - job.firstAttemptAt.getTime() >= RETRY_WINDOW)
    ) {
      await prisma.emailOutbox.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          leaseUntil: null,
          errorCode: 'retry_window_exhausted'
        }
      })
      metrics.failed++
      continue
    }
    try {
      const result = await resend.emails.send(
        {
          from: 'Fran from Expentrac <info@expentrac.app>',
          to: job.to,
          subject: job.subject,
          html: job.html
        },
        { idempotencyKey: job.id, signal: AbortSignal.timeout(15_000) }
      )
      if (result.error || !result.data) throw new Error('delivery_failed')
      await prisma.emailOutbox.update({
        where: { id: job.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          leaseUntil: null,
          errorCode: null
        }
      })
      metrics.sent++
    } catch {
      const failed = job.attempts + 1 >= MAX_ATTEMPTS
      await prisma.emailOutbox.update({
        where: { id: job.id },
        data: {
          status: failed ? 'failed' : 'pending',
          leaseUntil: null,
          errorCode: 'delivery_failed',
          nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** job.attempts)
        }
      })
      if (failed) metrics.failed++
      else metrics.pending++
    }
  }
  return metrics
}
