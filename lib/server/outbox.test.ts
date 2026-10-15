import { prisma } from '@lib/prisma'
import { Resend } from 'resend'

import { deliverOutbox } from './outbox'

jest.mock('@lib/prisma', () => ({
  prisma: {
    emailOutbox: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn()
    }
  }
}))
jest.mock('resend', () => ({ Resend: jest.fn() }))
const send = jest.fn()
const job = {
  id: 'daily/owner/2026-10-14',
  to: 'fixture@example.test',
  subject: 'Payments',
  html: '<p>Test</p>',
  attempts: 0,
  firstAttemptAt: null
}

beforeEach(() => {
  process.env.RESEND_KEY = 'unit-test-only'
  jest.clearAllMocks()
  ;(Resend as jest.Mock).mockImplementation(() => ({ emails: { send } }))
  ;(prisma.emailOutbox.findMany as jest.Mock).mockResolvedValue([job])
  ;(prisma.emailOutbox.updateMany as jest.Mock).mockResolvedValue({ count: 1 })
  send.mockResolvedValue({ data: { id: 'sent' }, error: null })
})

afterEach(() => {
  delete process.env.RESEND_KEY
})

test('missing delivery configuration leaves durable jobs pending without claiming them', async () => {
  delete process.env.RESEND_KEY
  expect(await deliverOutbox()).toEqual({ sent: 0, failed: 0, pending: 1 })
  expect(prisma.emailOutbox.updateMany).not.toHaveBeenCalled()
  expect(send).not.toHaveBeenCalled()
})

test('worker uses stable provider key and persists delivery', async () => {
  expect(await deliverOutbox()).toEqual({ sent: 1, failed: 0, pending: 0 })
  expect(send).toHaveBeenCalledWith(
    expect.objectContaining({ html: job.html }),
    expect.objectContaining({ idempotencyKey: job.id })
  )
  expect(prisma.emailOutbox.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ status: 'sent' })
    })
  )
})

test('only the worker that claims a job can send', async () => {
  ;(prisma.emailOutbox.updateMany as jest.Mock).mockResolvedValue({ count: 0 })
  await deliverOutbox()
  expect(send).not.toHaveBeenCalled()
})

test('provider error responses retain a pending retry', async () => {
  send.mockResolvedValue({ data: null, error: { message: 'test' } })
  expect(await deliverOutbox()).toEqual({ sent: 0, failed: 0, pending: 1 })
})

test('expired uncertain jobs are failed without sending again', async () => {
  ;(prisma.emailOutbox.findMany as jest.Mock).mockResolvedValue([
    { ...job, firstAttemptAt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  ])
  expect(await deliverOutbox()).toEqual({ sent: 0, failed: 1, pending: 0 })
  expect(send).not.toHaveBeenCalled()
})
