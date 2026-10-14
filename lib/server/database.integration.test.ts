import { notificationSdk } from '@lib/notification'
import { prisma } from '@lib/prisma'
import { NOTIFICATION_TYPE } from '@types'

let failRender = false
jest.mock('@lib/server/outbox', () => ({ deliverOutbox: jest.fn() }))
jest.mock('@lib/email', () => ({
  emailSdk: {
    sendGenericEmail: async (
      _to: string,
      _name: string,
      _message: string,
      db: typeof prisma,
      id: string
    ) => {
      if (failRender) throw new Error('render failure')
      return db.emailOutbox.create({
        data: {
          id,
          to: 'fixture@example.test',
          subject: 'Fixture',
          html: '<p>Test</p>'
        }
      })
    }
  }
}))
const local = process.env.EXPENTRAC_TEST_DB === 'true'
const suite = local ? describe : describe.skip

suite('isolated database transactions', () => {
  beforeAll(async () => {
    const url = new URL(process.env.POSTGRES_PRISMA_URL!)
    if (url.hostname !== '127.0.0.1' || url.pathname !== '/audit')
      throw new Error('Disposable database required')
    await prisma.user.create({
      data: { id: 'fixture-user', email: 'fixture@example.test' }
    })
  })
  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('notification and email snapshot are committed together', async () => {
    const notification = await notificationSdk.create('fixture-user', true, {
      type: NOTIFICATION_TYPE.GENERIC,
      message: 'Fixture'
    })
    expect(
      await prisma.notification.findUnique({ where: { id: notification!.id } })
    ).not.toBeNull()
    expect(
      await prisma.emailOutbox.findUnique({ where: { id: notification!.id } })
    ).not.toBeNull()
  })

  test('a rendering failure rolls back the notification as well', async () => {
    const before = await prisma.notification.count()
    failRender = true
    await expect(
      notificationSdk.create('fixture-user', true, {
        type: NOTIFICATION_TYPE.GENERIC,
        message: 'Must rollback'
      })
    ).rejects.toThrow('render failure')
    expect(await prisma.notification.count()).toBe(before)
    failRender = false
  })

  test('the database rejects duplicate durable delivery keys', async () => {
    const data = {
      id: 'unique-delivery',
      to: 'fixture@example.test',
      subject: 'Fixture',
      html: '<p>Test</p>'
    }
    await prisma.emailOutbox.create({ data })
    await expect(prisma.emailOutbox.create({ data })).rejects.toMatchObject({
      code: 'P2002'
    })
  })
})
