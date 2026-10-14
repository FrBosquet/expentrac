import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { setTimeout } from 'node:timers/promises'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const url = new URL(process.env.POSTGRES_PRISMA_URL ?? '')
if (process.env.EXPENTRAC_TEST_DB !== 'true' || url.hostname !== '127.0.0.1' || url.pathname !== '/audit') throw new Error('Disposable test database required')
for (const role of ['owner', 'recipient', 'third']) {
  await prisma.user.create({ data: { id: `browser-${role}`, name: `${role} Fixture`, email: `${role}@example.test` } })
  await prisma.session.create({ data: { userId: `browser-${role}`, sessionToken: `browser-session-${role}`, expires: new Date(Date.now() + 3_600_000) } })
}
await prisma.provider.create({ data: { id: 'browser-provider', name: 'Fixture employer' } })
await prisma.contract.create({ data: { id: 'browser-loan', name: 'Private owner loan', userId: 'browser-owner', type: 'LOAN', fee: 0,
  periods: { create: { fee: 49.99, payday: 14, from: new Date('2026-01-01'), to: new Date('2028-12-31') } },
  shares: { create: { id: 'browser-share', fromId: 'browser-owner', toId: 'browser-recipient' } }
} })
await prisma.contract.create({ data: { id: 'browser-sub', name: 'Fixture streaming', userId: 'browser-owner', type: 'SUBSCRIPTION', fee: 0,
  periods: { create: { fee: 12.5, payday: 14, periodicity: 'MONTHLY', from: new Date('2026-01-01') } }
} })
const env = { ...process.env, NEXTAUTH_URL: 'http://127.0.0.1:3100', NEXTAUTH_SECRET: 'browser-test-only', GOOGLE_CLIENT_ID: 'browser-test', GOOGLE_CLIENT_SECRET: 'browser-test', NEXT_PUBLIC_BASE_URL: '/api', RESEND_KEY: '' }
const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), process.env.EXPENTRAC_BROWSER_MODE === 'dev' ? 'dev' : 'start', '-p', '3100', '-H', '127.0.0.1'], { env, stdio: ['ignore', 'pipe', 'pipe'] })
let diagnostics = ''
for (const stream of [server.stdout, server.stderr]) stream.on('data', (data) => { diagnostics = (diagnostics + data).slice(-12_000) })
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Browser tests exited ${code}`)))
  })
}
try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch('http://127.0.0.1:3100/api/auth/session')).ok) { ready = true; break } } catch {}
    await setTimeout(500)
  }
  if (!ready) throw new Error(`Test server did not start: ${diagnostics}`)
  await run(process.execPath, [require.resolve('@playwright/test/cli'), 'test'])
} catch (error) {
  console.error(diagnostics)
  throw error
} finally {
  server.kill('SIGTERM')
  await new Promise((resolve) => server.once('exit', resolve))
  await prisma.$disconnect()
}
