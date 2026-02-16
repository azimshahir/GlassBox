import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clients = await prisma.client.findMany({
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { campaigns: true, dailyMetrics: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Email already exists' },
      { status: 400 }
    )
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(body.password, 10)

  // Create client first
  const client = await prisma.client.create({
    data: {
      companyName: body.companyName,
      monthlyBudget: body.monthlyBudget || 0,
      currency: body.currency || 'MYR',
      status: 'LEARNING',
      googleCustomerId: body.googleCustomerId,
      googleConnectionId: body.googleConnectionId,
    },
  })

  // Create user and link to client
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hashedPassword,
      name: body.name,
      role: 'CLIENT',
      clientId: client.id,
    },
  })

  // Update client to link user
  await prisma.client.update({
    where: { id: client.id },
    data: {},
  })

  return NextResponse.json({
    ...client,
    user: { email: user.email, name: user.name },
  })
}
