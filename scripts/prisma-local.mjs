import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const [operation, ...args] = process.argv.slice(2)
if (args.some((arg) => /^(--config|--url|--schema)(=|$)/.test(arg)))
  throw new Error(
    'Local commands use the reviewed repository config and explicit loopback URL'
  )
if (!['migrate', 'studio'].includes(operation))
  throw new Error('Expected migrate or studio')
const connection = process.env.EXPENTRAC_LOCAL_DATABASE_URL
if (!connection)
  throw new Error(
    'Set EXPENTRAC_LOCAL_DATABASE_URL explicitly. Local Prisma commands never default to .env.local credentials.'
  )
let target
try {
  target = new URL(connection)
} catch {
  throw new Error('Invalid local database URL')
}
if (
  !['postgres:', 'postgresql:'].includes(target.protocol) ||
  !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)
)
  throw new Error(
    'Local Prisma commands require a loopback database; use migration:production for the reviewed release procedure'
  )
for (const key of target.searchParams.keys()) {
  if (
    ![
      'schema',
      'sslmode',
      'sslcert',
      'sslkey',
      'sslrootcert',
      'connect_timeout',
      'application_name'
    ].includes(key)
  )
    throw new Error('Unsupported local connection option')
}
const require = createRequire(import.meta.url)
const child = spawn(
  process.execPath,
  [
    require.resolve('prisma/build/index.js'),
    ...(operation === 'migrate' ? ['migrate', 'dev'] : ['studio']),
    ...args
  ],
  {
    env: {
      ...process.env,
      POSTGRES_PRISMA_URL: connection,
      POSTGRES_URL_NON_POOLING: connection,
      DATABASE_URL: connection
    },
    stdio: 'inherit'
  }
)
child.on('error', () => {
  console.error('Unable to start local Prisma command')
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
