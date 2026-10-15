import { notificationSdk } from '@lib/notification'
import { prisma } from '@lib/prisma'
import { acknowledgeShareInvitations } from './share-notifications'
import { NOTIFICATION_TYPE, SHARE_STATE } from '@types'
import { recordInvitations } from './invitations'
import { deliverOutbox } from './outbox'
import { createAuthUser } from './auth-user'
import { assertDatabaseReady } from './schema-state'

jest.mock('@lib/auth', () => ({ authOptions: {} }))

let failRender = false
jest.mock('@lib/server/outbox', () => ({ deliverOutbox: jest.fn() }))
jest.mock('@lib/email', () => ({
  emailSdk: {
    sendWelcome: async (
      _to: string,
      _name: string,
      db: typeof prisma,
      id: string
    ) => {
      if (failRender) throw new Error('render failure')
      return db.emailOutbox.create({
        data: {
          id,
          to: 'fixture@example.test',
          subject: 'Welcome fixture',
          html: '<p>Welcome</p>'
        }
      })
    },
    sendDailyEmail: async (
      _to: string,
      _name: string,
      _loans: unknown,
      _subs: unknown,
      db: typeof prisma,
      id: string
    ) =>
      db.emailOutbox.create({
        data: {
          id,
          to: 'fixture@example.test',
          subject: 'Daily fixture',
          html: '<p>Daily</p>'
        }
      }),
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

  test.each([true, false])(
    'invitation response %s and acknowledgement commit or roll back together',
    async (accepted) => {
      const suffix = String(accepted)
      const ownerId = `atomic-share-owner-${suffix}`
      const shareId = `atomic-share-${suffix}`
      await prisma.user.create({ data: { id: ownerId } })
      await prisma.contract.create({
        data: {
          id: `atomic-contract-${suffix}`,
          userId: ownerId,
          type: 'LOAN',
          name: 'Atomic fixture',
          feeCents: 0,
          shares: {
            create: { id: shareId, fromId: ownerId, toId: 'fixture-user' }
          }
        }
      })
      const invitation = await prisma.notification.create({
        data: {
          userId: 'fixture-user',
          type: NOTIFICATION_TYPE.LOAN_SHARE,
          date: new Date(),
          payload: JSON.stringify({
            share: { id: shareId },
            state: SHARE_STATE.PENDING,
            preview: { name: 'Preserved preview' }
          })
        }
      })
      const unrelated = await prisma.notification.create({
        data: {
          userId: 'fixture-user',
          type: NOTIFICATION_TYPE.LOAN_SHARE,
          date: new Date(),
          payload: JSON.stringify({ share: { id: 'another-share' } })
        }
      })
      const otherUser = await prisma.notification.create({
        data: {
          userId: ownerId,
          type: NOTIFICATION_TYPE.LOAN_SHARE,
          date: new Date(),
          payload: JSON.stringify({ share: { id: shareId } })
        }
      })
      await expect(
        prisma.$transaction(async (db) => {
          await db.share.update({ where: { id: shareId }, data: { accepted } })
          await acknowledgeShareInvitations(
            db,
            'fixture-user',
            shareId,
            accepted
          )
          throw new Error('Forced rollback')
        })
      ).rejects.toThrow('Forced rollback')
      expect(
        (await prisma.share.findUniqueOrThrow({ where: { id: shareId } }))
          .accepted
      ).toBeNull()
      expect(
        (
          await prisma.notification.findUniqueOrThrow({
            where: { id: invitation.id }
          })
        ).ack
      ).toBe(false)
      await prisma.$transaction(async (db) => {
        await db.share.update({ where: { id: shareId }, data: { accepted } })
        await acknowledgeShareInvitations(db, 'fixture-user', shareId, accepted)
      })
      const confirmed = await prisma.notification.findUniqueOrThrow({
        where: { id: invitation.id }
      })
      expect(confirmed.ack).toBe(true)
      expect(JSON.parse(confirmed.payload as string)).toMatchObject({
        state: accepted ? SHARE_STATE.ACCEPTED : SHARE_STATE.REJECTED,
        preview: { name: 'Preserved preview' }
      })
      expect(
        (
          await prisma.notification.findUniqueOrThrow({
            where: { id: unrelated.id }
          })
        ).ack
      ).toBe(false)
      expect(
        (
          await prisma.notification.findUniqueOrThrow({
            where: { id: otherUser.id }
          })
        ).ack
      ).toBe(false)
      await prisma.$transaction((db) =>
        acknowledgeShareInvitations(db, 'fixture-user', shareId, accepted)
      )
      expect(
        (
          await prisma.notification.findUniqueOrThrow({
            where: { id: invitation.id }
          })
        ).payload
      ).toEqual(confirmed.payload)
    }
  )

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

  test('render failure rolls back the domain mutation and invitation accounting too', async () => {
    failRender = true
    await expect(
      prisma.$transaction(
        async (db) => {
          await recordInvitations(db, 'fixture-user', 1)
          await db.contract.create({
            data: {
              id: 'must-rollback',
              userId: 'fixture-user',
              name: 'Rollback fixture',
              type: 'LOAN'
            }
          })
          await notificationSdk.create(
            'fixture-user',
            true,
            { type: NOTIFICATION_TYPE.GENERIC, message: 'Rollback all' },
            db
          )
        },
        { isolationLevel: 'Serializable' }
      )
    ).rejects.toThrow('render failure')
    failRender = false
    expect(
      await prisma.contract.findUnique({ where: { id: 'must-rollback' } })
    ).toBeNull()
    expect(await prisma.invitationEvent.count()).toBe(0)
  })

  test('invitation quota counts persisted attempts and leaves existing recipients free', async () => {
    await prisma.$transaction(
      (db) => recordInvitations(db, 'fixture-user', 20),
      { isolationLevel: 'Serializable' }
    )
    await expect(
      prisma.$transaction((db) => recordInvitations(db, 'fixture-user', 0))
    ).resolves.toBeUndefined()
    await expect(
      prisma.$transaction((db) => recordInvitations(db, 'fixture-user', 1), {
        isolationLevel: 'Serializable'
      })
    ).rejects.toMatchObject({ status: 429 })
    expect(await prisma.invitationEvent.count()).toBe(20)
  })

  test('concurrent invitation bursts cannot exceed the quota', async () => {
    await prisma.user.create({ data: { id: 'concurrent-owner' } })
    const outcomes = await Promise.allSettled(
      [1, 2].map(() =>
        prisma.$transaction(
          (db) => recordInvitations(db, 'concurrent-owner', 12),
          { isolationLevel: 'Serializable' }
        )
      )
    )
    expect(
      outcomes.filter((outcome) => outcome.status === 'fulfilled')
    ).toHaveLength(1)
    expect(
      await prisma.invitationEvent.count({
        where: { userId: 'concurrent-owner' }
      })
    ).toBe(12)
  })

  test('daily digests enqueue without a per-user delivery pass', async () => {
    jest.clearAllMocks()
    await notificationSdk.create('fixture-user', true, {
      type: NOTIFICATION_TYPE.DAILY,
      day: '2026-10-15',
      loans: [],
      subs: []
    })
    expect(
      await prisma.emailOutbox.findUnique({
        where: { id: 'daily/fixture-user/2026-10-15' }
      })
    ).not.toBeNull()
    expect(deliverOutbox).not.toHaveBeenCalled()
  })

  test('new OAuth users and welcome work commit together without provider delivery', async () => {
    jest.clearAllMocks()
    const user = await createAuthUser({
      email: 'auth-fixture@example.test',
      name: 'Auth fixture',
      image: null,
      emailVerified: null
    })
    expect(
      await prisma.emailOutbox.findUnique({
        where: { id: `welcome/${user.id}` }
      })
    ).not.toBeNull()
    expect(deliverOutbox).not.toHaveBeenCalled()
  })

  test('welcome rendering failure cannot leave a new unlinked OAuth user behind', async () => {
    failRender = true
    await expect(
      createAuthUser({
        email: 'auth-rollback@example.test',
        name: 'Rollback fixture',
        image: null,
        emailVerified: null
      })
    ).rejects.toThrow('render failure')
    failRender = false
    expect(
      await prisma.user.findUnique({
        where: { email: 'auth-rollback@example.test' }
      })
    ).toBeNull()
  })

  test.each([
    'ALTER TABLE "Period" ALTER COLUMN fee TYPE DOUBLE PRECISION',
    'DROP TABLE "EmailOutbox"'
  ])('old or partial schemas are refused before a write: %s', async (sql) => {
    await expect(
      prisma.$transaction(async (db) => {
        await db.$executeRawUnsafe(sql)
        await assertDatabaseReady(db)
        await db.contract.create({
          data: {
            id: 'must-not-write-old-schema',
            userId: 'fixture-user',
            type: 'LOAN',
            name: 'Must not write'
          }
        })
      })
    ).rejects.toMatchObject({ status: 503 })
    expect(
      await prisma.contract.findUnique({
        where: { id: 'must-not-write-old-schema' }
      })
    ).toBeNull()
    await expect(assertDatabaseReady()).resolves.toBeUndefined()
  })
})
