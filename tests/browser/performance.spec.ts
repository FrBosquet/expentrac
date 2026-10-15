import { expect, test } from '@playwright/test'

test('record synthetic route delivery and avoid unrelated relation queries on profile', async ({
  browser
}, testInfo) => {
  const report = []
  for (const route of ['/', '/blog', '/dashboard', '/dashboard/profile']) {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'browser-session-owner',
        url: 'http://127.0.0.1:3100'
      }
    ])
    const page = await context.newPage()
    const api: Array<
      Promise<{ path: string; type: string | null; bytes: number }>
    > = []
    page.on('response', (response) => {
      const url = new URL(response.url())
      const path = url.pathname
      if (path.startsWith('/api/'))
        api.push(
          response.body().then((body) => ({
            path,
            type: url.searchParams.get('type'),
            bytes: body.byteLength
          }))
        )
    })
    await page.goto(`http://127.0.0.1:3100${route}`)
    if (route === '/dashboard')
      await expect(page.getByLabel('Expense forecast')).toBeVisible()
    else await expect(page.getByRole('heading').first()).toBeVisible()
    await page.waitForLoadState('networkidle')
    const delivery = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      const scripts = performance
        .getEntriesByType('resource')
        .filter(
          (resource) =>
            resource.name.includes('/_next/') &&
            new URL(resource.name).pathname.endsWith('.js')
        ) as PerformanceResourceTiming[]
      return {
        ttfbMs:
          Math.round(
            (navigation.responseStart - navigation.requestStart) * 100
          ) / 100,
        htmlEncodedBytes: navigation.encodedBodySize,
        javascriptEncodedBytes: scripts.reduce(
          (sum, script) => sum + script.encodedBodySize,
          0
        ),
        javascriptDecodedBytes: scripts.reduce(
          (sum, script) => sum + script.decodedBodySize,
          0
        ),
        javascriptRequests: scripts.length
      }
    })
    const requests = await Promise.all(api)
    if (route === '/dashboard/profile')
      expect(
        requests.some(({ path }) =>
          ['/api/share', '/api/provider-on-contract'].includes(path)
        )
      ).toBe(false)
    report.push({
      route,
      ...delivery,
      apiRequests: requests.length,
      apiBodyBytes: requests.reduce((sum, request) => sum + request.bytes, 0)
    })
    await context.close()
  }
  const json = JSON.stringify(
    {
      scope:
        'Synthetic localhost fixture; single cold browser context per route, server/build caches may be warm. HTTP API counts are not database query counts.',
      report
    },
    null,
    2
  )
  await testInfo.attach('route-metrics', {
    body: json,
    contentType: 'application/json'
  })
  console.log(json)
})
