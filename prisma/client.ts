import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

type ScriptPrismaClient = {
  prisma: PrismaClient
  target: 'turso' | 'sqlite'
  databaseLabel: string
}

export function createScriptPrismaClient(): ScriptPrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim()
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim()

  if (tursoUrl && tursoToken) {
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: tursoToken,
    })

    return {
      prisma: new PrismaClient({ adapter }),
      target: 'turso',
      databaseLabel: tursoUrl,
    }
  }

  const sqliteUrl = process.env.SQLITE_DATABASE_URL?.trim() || 'file:./prisma/dev.db'
  const adapter = new PrismaBetterSqlite3({ url: sqliteUrl })

  return {
    prisma: new PrismaClient({ adapter }),
    target: 'sqlite',
    databaseLabel: sqliteUrl,
  }
}
