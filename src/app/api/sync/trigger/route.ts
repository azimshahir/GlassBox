import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { syncClientData, checkAndCreateAlerts } from '@/lib/google-ads/sync'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clientId, days = 30 } = await request.json()

  if (!clientId) {
    return NextResponse.json(
      { error: 'Client ID required' },
      { status: 400 }
    )
  }

  const result = await syncClientData(clientId, days)

  if (result.success) {
    // Check for budget alerts after successful sync
    await checkAndCreateAlerts(clientId)
  }

  return NextResponse.json(result)
}
