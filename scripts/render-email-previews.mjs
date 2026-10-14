import { chromium } from '@playwright/test'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
const directory = join(tmpdir(), 'expentrac-email-previews')
const logo = `data:image/png;base64,${(await readFile('public/logo.png')).toString('base64')}`
const browser = await chromium.launch(process.platform === 'darwin' ? { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' } : {})
const page = await browser.newPage({ viewport: { width: 560, height: 1000 } })
await page.route('http*://**/*', (route) => route.abort())
try {
  for (const name of await readdir(directory)) {
    if (!name.endsWith('.html')) continue
    const html = (await readFile(join(directory, name), 'utf8')).replaceAll('https://expentrac.app/logo.png', logo)
    await page.setContent(html)
    await page.screenshot({ path: join(directory, name.replace('.html', '.png')), fullPage: true })
  }
  console.log(`Email preview screenshots saved to ${directory}`)
} finally { await browser.close() }
