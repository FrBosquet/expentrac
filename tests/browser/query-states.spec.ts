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
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    window.dispatchEvent(new Event('visibilitychange'))
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    window.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator('[role=alert]').filter({ hasText: /Could not refresh|Fixture validation/ })).toContainText(
    'Could not refresh your data'
  )
  await expect(
    page.getByRole('heading', { name: /owner/i, exact: true, level: 1 })
  ).toBeVisible()
  await expect(
    page.getByRole('status', { name: 'Loading page' })
  ).not.toBeVisible()
  fail = false
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(page.locator('[role=alert]').filter({ hasText: /Could not refresh|Fixture validation/ })).not.toBeVisible()
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
  await expect(page.locator('[role=alert]').filter({ hasText: /Could not refresh|Fixture validation/ })).toContainText(
    'Fixture validation failed'
  )
  await expect(page.locator('#name')).toHaveValue('Retained draft')
  await expect(
    page.getByRole('button', { name: 'Save', exact: true })
  ).toBeEnabled()
})
