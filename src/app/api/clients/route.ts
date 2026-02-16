import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
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

  // Create user and client profile
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password, // In production, hash this!
      role: 'CLIENT',
      client: {
        create: {
          companyName: body.companyName,
          totalBudget: body.totalBudget,
          status: 'LEARNING',
        },
      },
    },
    include: { client: true },
  })

  return NextResponse.json(user)
}
