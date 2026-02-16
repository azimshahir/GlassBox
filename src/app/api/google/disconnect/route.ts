import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { connectionId } = await request.json()

  if (!connectionId) {
    return NextResponse.json(
      { error: 'Connection ID required' },
      { status: 400 }
    )
  }

  // Check if any clients are using this connection
  const clientsUsingConnection = await prisma.client.count({
    where: { googleConnectionId: connectionId },
  })

  if (clientsUsingConnection > 0) {
    return NextResponse.json(
      {
        error: `Cannot disconnect: ${clientsUsingConnection} client(s) are using this connection`,
      },
      { status: 400 }
    )
  }

  await prisma.googleConnection.delete({
    where: { id: connectionId },
  })

  return NextResponse.json({ success: true })
}
