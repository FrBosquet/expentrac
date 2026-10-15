import { expect, test } from '@playwright/test'

test('public blog renders published content and unknown slugs return 404', async ({
  page,
  request
}) => {
  await page.goto('/blog')
  await page.getByRole('link', { name: /Hello world/ }).click()
  await expect(
    page.getByRole('heading', { name: '👋 Hello world!', exact: true })
  ).toBeVisible()
  await expect(page).toHaveTitle(/Hello world/)
  expect((await request.get('/blog/unknown-audit-fixture')).status()).toBe(404)
  expect((await request.get('/blog/hello-world.mdx')).status()).toBe(404)
})

test.beforeEach(async ({ context, page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  page.on('pageerror', (error) =>
    console.error('Browser runtime error:', error.message)
  )

  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'browser-session-owner',
      url: 'http://127.0.0.1:3100'
    }
  ])
})

test('real session APIs enforce owner, accepted recipient, and third-user policies', async ({
  request
}) => {
  const cookie = (role: string) => ({
    Cookie: `next-auth.session-token=browser-session-${role}`
  })
  expect((await request.get('/api/contract')).status()).toBe(401)
  expect(
    (
      await request.get('/api/contract?userId=browser-third', {
        headers: cookie('owner')
      })
    ).status()
  ).toBe(403)
  expect(
    (
      await request.get('/api/contract?cursor=browser-loan', {
        headers: cookie('third')
      })
    ).status()
  ).toBe(400)
  expect(
    (
      await request.get('/api/contract?cursor=browser-loan&type=SUBSCRIPTION', {
        headers: cookie('owner')
      })
    ).status()
  ).toBe(400)
  const owner = await request.get('/api/contract/browser-loan', {
    headers: cookie('owner')
  })
  expect(owner.status()).toBe(200)
  const ownerData = await owner.json()
  expect(ownerData.data.user.emailVerified).toBeUndefined()
  expect(ownerData.data.user.email).toBeUndefined()
  const invitation = await (
    await request.get('/api/share', { headers: cookie('recipient') })
  ).json()
  expect(invitation[0].contract).toBeNull()
  expect(invitation[0].preview.name).toBe('Private owner loan')
  expect(
    (
      await request.get('/api/contract/browser-loan', {
        headers: cookie('recipient')
      })
    ).status()
  ).toBe(403)
  expect(
    (
      await request.patch('/api/share/browser-share', {
        headers: cookie('third'),
        data: { accepted: true }
      })
    ).status()
  ).toBe(403)
  expect(
    (
      await request.patch('/api/share/browser-share', {
        headers: cookie('recipient'),
        data: { accepted: 'true' }
      })
    ).status()
  ).toBe(400)
  expect(
    (
      await request.patch('/api/share/browser-share', {
        headers: cookie('recipient'),
        data: { accepted: true }
      })
    ).status()
  ).toBe(200)
  expect(
    (
      await request.get('/api/contract/browser-loan', {
        headers: cookie('recipient')
      })
    ).status()
  ).toBe(200)
  expect(
    (
      await request.get('/api/contract/browser-loan', {
        headers: cookie('third')
      })
    ).status()
  ).toBe(403)
  expect((await request.get('/api/notification/cron')).status()).toBe(401)
  const subs = await (
    await request.get('/api/contract?type=SUBSCRIPTION', {
      headers: cookie('owner')
    })
  ).json()
  expect(subs.map((item: { type: string }) => item.type)).toEqual([
    'SUBSCRIPTION'
  ])
})

test('profile mutation updates profile and navigation without hard reload', async ({
  page
}) => {
  await page.goto('/dashboard/profile')
  await expect(
    page.getByRole('heading', { name: 'owner Fixture', exact: true, level: 1 })
  ).toBeVisible()
  await page.locator('a[href="profile/edit"]').click()
  await page.locator('#name').fill('Updated owner')
  await page.locator('#occupation').fill('Test role')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Updated owner', exact: true, level: 1 })
  ).toBeVisible()
  await expect(page.getByText('Test role', { exact: true })).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Updated owner', exact: true, level: 1 })
  ).toBeVisible()
})

test('contract detail survives direct navigation and reload; fresh account cannot see owner data', async ({
  page,
  context
}) => {
  await page.goto('/dashboard/loans/browser-loan')
  await expect(
    page.getByRole('heading', { name: 'Private owner loan' })
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Private owner loan' })
  ).toBeVisible()
  await context.clearCookies()
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'browser-session-third',
      url: 'http://127.0.0.1:3100'
    }
  ])
  await page.goto('/dashboard/loans/browser-loan')
  await expect(
    page.getByText('Resource not found or no longer shared with you.')
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Private owner loan' })
  ).toHaveCount(0)
})

test('forecast renders, keyboard tooltip works, and month controls update UI state', async ({
  page
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/dashboard')
  const forecast = page.getByLabel('Expense forecast')
  await expect(forecast).toBeVisible()
  const chart = forecast.getByRole('application')
  await expect(chart).toBeVisible()
  await chart.focus()
  await chart.press('ArrowRight')
  await expect(forecast.getByText(/Monthly amount/)).toBeVisible()
  const original = await page
    .getByRole('button', {
      name: /October|November|December|January|February|March|April|May|June|July|August|September/i
    })
    .first()
    .innerText()
  await page.getByRole('button', { name: 'Next month', exact: true }).click()
  await expect(
    page.getByRole('button', { name: original, exact: true })
  ).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Previous month', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: original, exact: true })
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('dashboard.png'),
    fullPage: true,
    animations: 'disabled'
  })
  expect(errors).toEqual([])
})

test('themes persist and dashboard/dialog fit mobile screens', async ({
  page
}, testInfo) => {
  await page.goto('/dashboard')
  await expect(page.getByLabel('Expense forecast')).toBeVisible()
  const body = page.locator('body')
  const light = page.getByRole('button', { name: 'Switch to light theme' })
  if (await light.isVisible()) await light.click()
  await expect(body).not.toHaveClass(/dark/)
  await expect(body).toHaveCSS('background-color', 'rgb(226, 232, 240)')
  await page.screenshot({
    path: testInfo.outputPath('light-desktop.png'),
    fullPage: true,
    animations: 'disabled'
  })
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(body).toHaveClass(/dark/)
  await expect(body).toHaveCSS('background-color', 'rgb(15, 23, 42)')
  await page.reload()
  await expect(page.getByLabel('Expense forecast')).toBeVisible()
  await expect(body).toHaveClass(/dark/)
  await page.screenshot({
    path: testInfo.outputPath('dark-desktop.png'),
    fullPage: true,
    animations: 'disabled'
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByLabel('Expense forecast')).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('dark-mobile.png'),
    fullPage: true,
    animations: 'disabled'
  })
  const overflow = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((node) => {
        const box = node.getBoundingClientRect()
        return box.right > window.innerWidth + 1 && box.width > 0
      })
      .slice(0, 12)
      .map((node) => ({
        tag: node.tagName,
        class: node.className,
        width: node.getBoundingClientRect().width
      }))
  )
  await expect
    .poll(
      () =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        ),
      { message: JSON.stringify(overflow) }
    )
    .toBe(true)
  await page.goto('/dashboard/loans')
  await page.getByRole('button', { name: 'NEW LOAN' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const box = await page.getByRole('dialog').boundingBox()
  expect(box!.width).toBeLessThanOrEqual(390)
  await page.screenshot({
    path: testInfo.outputPath('dialog-mobile.png'),
    fullPage: true,
    animations: 'disabled'
  })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goto('/')
  await expect(page.getByRole('heading').first()).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('landing-mobile.png'),
    fullPage: true,
    animations: 'disabled'
  })
})
