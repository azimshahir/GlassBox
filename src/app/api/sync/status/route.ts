import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const connectionId = searchParams.get('connectionId')
  const limit = parseInt(searchParams.get('limit') || '10')

  const where = connectionId ? { connectionId } : {}

  const logs = await prisma.syncLog.findMany({
    where,
    orderBy: { startedAt: 'desc' },
    take: limit,
    include: {
      connection: {
        select: {
          googleEmail: true,
        },
      },
    },
  })

  return NextResponse.json(logs)
}
