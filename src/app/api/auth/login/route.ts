import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { client: true },
  })

  if (!user || user.password !== password) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  // Set simple session cookie
  const cookieStore = await cookies()
  cookieStore.set('userId', user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  cookieStore.set('userRole', user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    clientId: user.client?.id,
  })
}
