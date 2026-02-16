import * as bcrypt from 'bcryptjs'
import { createScriptPrismaClient } from './client'

function getArg(name: string) {
  const match = process.argv
    .slice(2)
    .find((entry) => entry.startsWith(`--${name}=`))
  return match ? match.split('=').slice(1).join('=').trim() : ''
}

async function main() {
  const { prisma, target, databaseLabel } = createScriptPrismaClient()
  const args = new Set(process.argv.slice(2))
  try {
    console.log(`Bootstrap target: ${target} (${databaseLabel})`)
    if (args.has('--expect-remote') && target !== 'turso') {
      throw new Error(
        'Expected Turso target but script is using sqlite. Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.'
      )
    }

    const email = getArg('email') || process.env.ADMIN_EMAIL || 'admin@glassbox.com'
    const name = getArg('name') || process.env.ADMIN_NAME || 'Admin GlassBox'
    const rawPassword = getArg('password') || process.env.ADMIN_PASSWORD || ''

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true },
    })

    if (!existing && !rawPassword) {
      throw new Error(
        'ADMIN_PASSWORD is required when creating a new admin. Example: ADMIN_PASSWORD="StrongPass123" npm run db:bootstrap-admin'
      )
    }

    if (existing && !existing.password && !rawPassword) {
      throw new Error(
        `User ${email} exists without credential password. Provide --password=... or ADMIN_PASSWORD=...`
      )
    }

    const password = rawPassword ? await bcrypt.hash(rawPassword, 10) : undefined

    if (existing) {
      await prisma.user.update({
        where: { email },
        data: {
          name,
          role: 'ADMIN',
          clientId: null,
          ...(password ? { password } : {}),
        },
      })
      console.log(`Updated existing user as ADMIN: ${email}`)
    } else {
      await prisma.user.create({
        data: {
          email,
          name,
          role: 'ADMIN',
          password: password!,
        },
      })
      console.log(`Created admin user: ${email}`)
    }

    console.log('Bootstrap admin complete.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
