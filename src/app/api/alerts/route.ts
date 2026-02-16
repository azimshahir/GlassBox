import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const clientId = searchParams.get('clientId')
  const unreadOnly = searchParams.get('unread') === 'true'

  const where: {
    clientId?: string
    isRead?: boolean
  } = {}

  if (session.user.role !== 'ADMIN') {
    if (!session.user.clientId) {
      return NextResponse.json({ error: 'No client associated' }, { status: 403 })
    }
    where.clientId = session.user.clientId
  } else if (clientId) {
    where.clientId = clientId
  }

  if (unreadOnly) {
    where.isRead = false
  }

  const alerts = await prisma.alert.findMany({
    where,
    include: {
      client: { select: { companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(alerts)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { alertId, isRead } = await request.json()

  if (!alertId) {
    return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
  }

  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
  })

  if (!alert) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  }

  // Check access
  if (session.user.role !== 'ADMIN' && session.user.clientId !== alert.clientId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.alert.update({
    where: { id: alertId },
    data: { isRead },
  })

  return NextResponse.json(updated)
}
