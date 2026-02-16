import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_KEYS = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
]

// Mask sensitive values for display (show first 8 chars + ****)
function maskValue(key: string, value: string): string {
  if (!value) return ''
  if (key === 'GOOGLE_CLIENT_ID') return value // Client ID is not secret
  if (value.length <= 8) return '****'
  return value.slice(0, 8) + '****'
}

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.settings.findMany({
    where: { key: { in: ALLOWED_KEYS } },
  })

  const result: Record<string, string> = {}
  for (const key of ALLOWED_KEYS) {
    const setting = settings.find((s) => s.key === key)
    result[key] = setting ? maskValue(key, setting.value) : ''
  }

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  for (const key of ALLOWED_KEYS) {
    const value = body[key]
    // Skip if not provided or if it's a masked value (contains ****)
    if (value === undefined || value === '' || value.includes('****')) continue

    await prisma.settings.upsert({
      where: { key },
      create: { key, value: value.trim() },
      update: { value: value.trim() },
    })
  }

  return NextResponse.json({ success: true })
}
