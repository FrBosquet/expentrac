import EmbeddedPostgres from 'embedded-postgres'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const directory = await mkdtemp(join(tmpdir(), 'expentrac-test-'))
const postgres = new EmbeddedPostgres({
  databaseDir: join(directory, 'db'), port: 55432, user: 'audit', password: 'audit',
  persistent: false, postgresFlags: ['-h', '127.0.0.1', '-k', directory], onLog: () => {}
})
const env = { ...process.env,
  POSTGRES_PRISMA_URL: 'postgresql://audit:audit@127.0.0.1:55432/audit',
  POSTGRES_URL_NON_POOLING: 'postgresql://audit:audit@127.0.0.1:55432/audit',
  DATABASE_URL: 'postgresql://audit:audit@127.0.0.1:55432/audit',
  EXPENTRAC_TEST_DB: 'true', RESEND_KEY: 're_local_test', CRON_SECRET: 'local-test-secret'
}
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Test process exited ${code}`)))
  })
}
try {
  await postgres.initialise()
  await postgres.start()
  await postgres.createDatabase('audit')
  await run(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'])
  const [command, ...args] = process.argv.slice(2)
  if (command) await run(command, args)
  console.log('Disposable PostgreSQL migration checks passed')
} finally {
  await postgres.stop()
  await rm(directory, { recursive: true, force: true })
}
