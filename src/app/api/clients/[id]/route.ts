import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const client = await prisma.clientProfile.findUnique({
    where: { id: parseInt(id) },
    include: { user: { select: { email: true } } },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json(client)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const client = await prisma.clientProfile.update({
    where: { id: parseInt(id) },
    data: {
      companyName: body.companyName,
      totalBudget: body.totalBudget,
      status: body.status,
      notes: body.notes,
    },
  })

  return NextResponse.json(client)
}
