import { expect, test } from '@playwright/test'

const cookie = (role: string) => ({
  Cookie: `next-auth.session-token=browser-session-${role}`
})
const loan = {
  name: 'Mutation fixture',
  fee: '10.01',
  initial: '5.01',
  startDate: '2026-01-15',
  endDate: '2028-12-31',
  link: 'https://example.test/loan',
  'sharedWith:0': 'browser-third'
}

test('typed CRUD preserves cents and accepted shares, rejects recipient writes, and deletes only for the owner', async ({
  request,
  page,
  context
}) => {
  const created = await request.post('/api/loan', {
    headers: cookie('owner'),
    data: loan
  })
  expect(created.status()).toBe(201)
  const contract = (await created.json()).data
  expect(contract.feeCents).toBe(501)
  expect(contract.periods[0].feeCents).toBe(1001)
  expect(contract.shares).toHaveLength(1)
  expect(
    (
      await request.patch(`/api/loan/${contract.id}`, {
        headers: cookie('third'),
        data: loan
      })
    ).status()
  ).toBe(403)
  expect(
    (
      await request.delete(`/api/contract/${contract.id}`, {
        headers: cookie('third')
      })
    ).status()
  ).toBe(403)
  const share = contract.shares[0]
  expect(
    (
      await request.patch(`/api/share/${share.id}`, {
        headers: cookie('third'),
        data: { accepted: true }
      })
    ).status()
  ).toBe(200)
  expect(
    (
      await request.patch(`/api/share/${share.id}`, {
        headers: cookie('third'),
        data: { accepted: true }
      })
    ).status()
  ).toBe(200)
  const updated = await request.patch(`/api/loan/${contract.id}`, {
    headers: cookie('owner'),
    data: { ...loan, fee: '10.02', payday: 31 }
  })
  expect(updated.status()).toBe(200)
  const after = (await updated.json()).data
  expect(after.periods[0].feeCents).toBe(1002)
  expect(after.periods[0].payday).toBe(31)
  expect(after.shares).toHaveLength(1)
  expect(after.shares[0].accepted).toBe(true)
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'browser-session-third',
      url: 'http://127.0.0.1:3100'
    }
  ])
  await page.goto(`/dashboard/loans/${contract.id}`)
  await expect(
    page.getByRole('heading', { name: loan.name, exact: true })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit loan' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Delete loan' })).toHaveCount(0)
  expect(
    (
      await request.delete(`/api/contract/${contract.id}`, {
        headers: cookie('owner')
      })
    ).status()
  ).toBe(200)
  expect(
    (
      await request.get(`/api/contract/${contract.id}`, {
        headers: cookie('owner')
      })
    ).status()
  ).toBe(404)
})

test('editing carryover contracts creates missing links and changes only the active subscription period', async ({
  request
}) => {
  const updated = await request.patch('/api/loan/browser-loan', {
    headers: cookie('owner'),
    data: {
      ...loan,
      name: 'Private owner loan',
      fee: '49.99',
      initial: '0',
      payday: 14,
      startDate: '2026-01-01',
      'sharedWith:0': 'browser-recipient'
    }
  })
  expect(updated.status()).toBe(200)
  expect((await updated.json()).data.resources).toHaveLength(1)
  const sub = await request.patch('/api/subscription/browser-sub', {
    headers: cookie('owner'),
    data: {
      name: 'Fixture streaming',
      fee: '13.75',
      payday: 14,
      yearly: 'off',
      link: 'https://example.test/sub'
    }
  })
  expect(sub.status()).toBe(200)
  const data = (await sub.json()).data
  expect(
    data.periods.find((period: { to: string | null }) => period.to !== null)
      .feeCents
  ).toBe(500)
  expect(
    data.periods.find((period: { to: string | null }) => period.to === null)
      .feeCents
  ).toBe(1375)
  expect(data.resources).toHaveLength(1)
})

test('invitation deletion cannot reset the sliding-hour limit; edits without new recipients remain allowed', async ({
  request
}) => {
  const ids = []
  const day = Number(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Madrid',
      day: '2-digit'
    }).format(new Date())
  )
  const year = new Date().getFullYear()
  const body = {
    ...loan,
    startDate: `${year}-01-${String(day).padStart(2, '0')}`,
    endDate: `${year + 2}-12-31`
  }
  for (let index = 0; index < 20; index++) {
    const response = await request.post('/api/loan', {
      headers: cookie('limit'),
      data: body
    })
    expect(response.status()).toBe(201)
    ids.push((await response.json()).data.id)
  }
  expect(
    (
      await request.post('/api/loan', { headers: cookie('limit'), data: body })
    ).status()
  ).toBe(429)
  expect(
    (
      await request.delete(`/api/contract/${ids[0]}`, {
        headers: cookie('limit')
      })
    ).status()
  ).toBe(200)
  expect(
    (
      await request.post('/api/loan', { headers: cookie('limit'), data: body })
    ).status()
  ).toBe(429)
  expect(
    (
      await request.patch(`/api/loan/${ids[1]}`, {
        headers: cookie('limit'),
        data: body
      })
    ).status()
  ).toBe(200)
  const headers = { Authorization: 'Bearer local-test-secret' }
  const first = await request.get('/api/notification/cron', { headers })
  expect(first.status()).toBe(200)
  const second = await request.get('/api/notification/cron', { headers })
  expect(second.status()).toBe(200)
  expect((await second.json()).queued).toBe(0)
  const notifications = await (
    await request.get('/api/notification', { headers: cookie('limit') })
  ).json()
  const daily = notifications.filter(
    (item: { type: string }) => item.type === 'DAILY'
  )
  expect(daily).toHaveLength(1)
  expect(
    JSON.parse(daily[0].payload).loans.every(
      (item: { type: string }) => item.type === 'LOAN'
    )
  ).toBe(true)
  expect(
    JSON.parse(daily[0].payload).subs.every(
      (item: { type: string }) => item.type === 'SUBSCRIPTION'
    )
  ).toBe(true)
})

test('pause and resume update detail without rewriting old periods', async ({
  page,
  context,
  request
}) => {
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'browser-session-owner',
      url: 'http://127.0.0.1:3100'
    }
  ])
  await page.goto('/dashboard/subscriptions/browser-sub')
  await expect(
    page.getByRole('heading', { name: 'Fixture streaming', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Pause subscription', exact: true })
    .click()
  const pausedOn = await page
    .getByRole('dialog')
    .locator('input[name="date"]')
    .inputValue()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Submit', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: /Fixture streaming.*Paused/ })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Edit subscription' })
  ).toBeDisabled()
  await page
    .getByRole('button', { name: 'Resume subscription', exact: true })
    .click()
  const tomorrow = new Date(`${pausedOn}T00:00:00Z`)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const dialog = page.getByRole('dialog')
  await dialog
    .locator('input[name="date"]')
    .fill(tomorrow.toISOString().slice(0, 10))
  await dialog.locator('input[name="fee"]').fill('17.25')
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'Fixture streaming', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Edit subscription' })
  ).toBeEnabled()
  const data = (
    await (
      await request.get('/api/contract/browser-sub', {
        headers: cookie('owner')
      })
    ).json()
  ).data
  expect(data.periods).toHaveLength(3)
  expect(
    data.periods.find((period: { to: string | null }) => period.to === null)
      .feeCents
  ).toBe(1725)
  expect(
    data.periods.some((period: { feeCents: number }) => period.feeCents === 500)
  ).toBe(true)
})
