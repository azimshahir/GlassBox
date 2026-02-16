import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const connections = await prisma.googleConnection.findMany({
    select: {
      id: true,
      googleEmail: true,
      mccAccountId: true,
      isActive: true,
      lastSyncAt: true,
      lastSyncStatus: true,
      createdAt: true,
      _count: {
        select: { clients: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(connections)
}
