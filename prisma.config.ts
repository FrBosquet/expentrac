import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Explicit environment loading, without overriding the disposable test connection.
config({ path: '.env.local', override: false, quiet: true })
config({ override: false, quiet: true })
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url:
      process.env.POSTGRES_URL_NON_POOLING ??
      process.env.POSTGRES_PRISMA_URL ??
      'postgresql://unconfigured@127.0.0.1:1/unconfigured'
  }
})
