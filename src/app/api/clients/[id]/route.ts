import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      campaigns: {
        include: {
          metrics: {
            orderBy: { date: 'desc' },
            take: 30,
          },
        },
      },
      dailyMetrics: {
        orderBy: { date: 'desc' },
        take: 30,
      },
      googleConnection: {
        select: { id: true, googleEmail: true, lastSyncAt: true },
      },
    },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Check access: Admin can access all, client can only access their own
  if (session.user.role !== 'ADMIN' && session.user.clientId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(client)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const client = await prisma.client.update({
    where: { id },
    data: {
      companyName: body.companyName,
      monthlyBudget: body.monthlyBudget,
      status: body.status,
      notes: body.notes,
      currency: body.currency,
      googleCustomerId: body.googleCustomerId,
      googleConnectionId: body.googleConnectionId,
    },
  })

  return NextResponse.json(client)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  await prisma.client.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
