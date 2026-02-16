import path from 'node:path'
import { defineConfig } from 'prisma/config'

const tursoUrl = process.env.TURSO_DATABASE_URL?.trim()
const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim()

const datasourceUrl =
  tursoUrl && tursoToken
    ? `${tursoUrl}${tursoUrl.includes('?') ? '&' : '?'}authToken=${encodeURIComponent(tursoToken)}`
    : process.env.DATABASE_URL?.trim() || 'file:./prisma/dev.db'

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: datasourceUrl,
  },
})
