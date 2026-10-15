import { expect, test } from '@playwright/test'

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'browser-session-owner',
      url: 'http://127.0.0.1:3100'
    }
  ])
})

test('cold detail displays a skeleton while data loads, then the confirmed contract', async ({
  page
}) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/contract?**', async (route) => {
    const response = await route.fetch()
    await gate
    await route.fulfill({ response })
  })
  await page.goto('/dashboard/loans/browser-loan')
  await expect(page.getByRole('status', { name: 'Loading page' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Private owner loan' })
  ).not.toBeVisible()
  release()
  await expect(
    page.getByRole('heading', { name: 'Private owner loan' })
  ).toBeVisible()
  await expect(
    page.getByRole('status', { name: 'Loading page' })
  ).not.toBeVisible()
})

test('failed profile refetch retains content and exposes a retry that recovers', async ({
  page
}) => {
  await page.goto('/dashboard/profile')
  await expect(
    page.getByRole('heading', { name: /owner/i, exact: true, level: 1 })
  ).toBeVisible()
  let fail = true
  await page.route('**/api/profile', async (route) => {
    if (fail)
      await route.fulfill({
        status: 400,
        json: { message: 'Fixture refetch failure' }
      })
    else await route.continue()
  })
  await page.evaluate(() => {
    const now = Date.now
    Date.now = () => now() + 301_000
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden'
    })
    window.dispatchEvent(new Event('visibilitychange'))
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible'
    })
    window.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(
    page
      .locator('[role=alert]')
      .filter({ hasText: /Could not refresh|Fixture validation/ })
  ).toContainText('Could not refresh your data')
  await expect(
    page.getByRole('heading', { name: /owner/i, exact: true, level: 1 })
  ).toBeVisible()
  await expect(
    page.getByRole('status', { name: 'Loading page' })
  ).not.toBeVisible()
  fail = false
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(
    page
      .locator('[role=alert]')
      .filter({ hasText: /Could not refresh|Fixture validation/ })
  ).not.toBeVisible()
})

test('profile mutation keeps its draft and shows an inline failure', async ({
  page
}) => {
  await page.goto('/dashboard/profile/edit')
  await page.locator('#name').fill('Retained draft')
  await page.route('**/api/profile', async (route) => {
    if (route.request().method() === 'PATCH')
      await route.fulfill({
        status: 400,
        json: { message: 'Fixture validation failed' }
      })
    else await route.continue()
  })
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(
    page
      .locator('[role=alert]')
      .filter({ hasText: /Could not refresh|Fixture validation/ })
  ).toContainText('Fixture validation failed')
  await expect(page.locator('#name')).toHaveValue('Retained draft')
  await expect(
    page.getByRole('button', { name: 'Save', exact: true })
  ).toBeEnabled()
})

test('user search debounces input and never displays an older response over the latest term', async ({
  page
}) => {
  await page.goto('/dashboard/loans')
  await page.getByRole('button', { name: 'NEW LOAN' }).click()
  await page.getByRole('combobox', { name: 'Find mates' }).click()
  const input = page.getByPlaceholder('write its email')
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  const terms: string[] = []
  await page.route('**/api/user?**', async (route) => {
    const term = new URL(route.request().url()).searchParams.get('search')!
    terms.push(term)
    if (term === 'old') await gate
    await route
      .fulfill({
        json: [
          {
            id: term,
            name: `${term} result`,
            email: `${term}@example.test`,
            image: null
          }
        ]
      })
      .catch(() => {})
  })
  await input.fill('ol')
  await expect(page.getByText('At least three characters')).toBeVisible()
  expect(terms).toEqual([])
  const started = page.waitForRequest('**/api/user?search=old')
  await input.fill('old')
  await started
  await input.fill('new')
  await expect(page.getByRole('option', { name: /new result/ })).toBeVisible()
  release()
  await expect(
    page.getByRole('option', { name: /old result/ })
  ).not.toBeVisible()
  await page.getByRole('option', { name: /new result/ }).click()
  await expect(
    page.getByRole('dialog').getByText('new result', { exact: true })
  ).toBeVisible()
})

for (const accepted of [true, false])
  test(`invitation ${accepted ? 'accept' : 'reject'} updates notification and access in one mutation`, async ({
    page,
    context,
    request
  }) => {
    const owner = { Cookie: 'next-auth.session-token=browser-session-owner' }
    const recipient = {
      Cookie: 'next-auth.session-token=browser-session-recipient'
    }
    const response = await request.post('/api/loan', {
      headers: owner,
      data: {
        name: `Atomic invitation ${accepted}`,
        fee: '10',
        initial: '0',
        startDate: '2026-01-15',
        endDate: '2028-12-31',
        'sharedWith:0': 'browser-recipient'
      }
    })
    expect(response.status()).toBe(201)
    const contract = (await response.json()).data
    const shareId = contract.shares[0].id
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'browser-session-recipient',
        url: 'http://127.0.0.1:3100'
      }
    ])
    const writes: string[] = []
    page.on('request', (req) => {
      if (req.method() === 'PATCH') writes.push(new URL(req.url()).pathname)
    })
    await page.goto('/dashboard/notifications')
    const card = page
      .locator('div')
      .filter({ has: page.getByText(contract.name, { exact: true }) })
      .filter({
        has: page.getByRole('button', {
          name: 'Accept invitation',
          exact: true
        })
      })
      .last()
    const confirmed = page.waitForResponse(response => response.url().endsWith(`/api/share/${shareId}`) && response.request().method() === 'PATCH')
    await card
      .getByRole('button', {
        name: accepted ? 'Accept invitation' : 'Reject invitation',
        exact: true
      })
      .click()
    await expect(
      card.getByRole('button', { name: 'Accept invitation', exact: true })
    ).not.toBeVisible()
    expect((await confirmed).status()).toBe(200)
    expect(writes).toEqual([`/api/share/${shareId}`])
    const notifications = await (
      await request.get('/api/notification', { headers: recipient })
    ).json()
    const invitation = notifications.find(
      (item: { payload: string }) =>
        JSON.parse(item.payload).share?.id === shareId
    )
    expect(invitation.ack).toBe(true)
    expect(JSON.parse(invitation.payload).state).toBe(accepted ? 1 : 2)
    expect(
      (
        await request.get(`/api/contract/${contract.id}`, {
          headers: recipient
        })
      ).status()
    ).toBe(accepted ? 200 : 403)
    expect(
      (
        await request.patch(`/api/share/${shareId}`, {
          headers: recipient,
          data: { accepted }
        })
      ).status()
    ).toBe(200)
  })
