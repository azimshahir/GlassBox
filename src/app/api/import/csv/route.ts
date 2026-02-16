import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CSVRow {
  date: string
  impressions: string | number
  clicks: string | number
  cost: string | number
  conversions: string | number
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clientId, data } = await request.json()

  if (!clientId || !data || !Array.isArray(data)) {
    return NextResponse.json(
      { error: 'Client ID and data array required' },
      { status: 400 }
    )
  }

  // Validate client exists
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  let imported = 0
  let errors: string[] = []

  for (const row of data as CSVRow[]) {
    try {
      if (!row.date) {
        errors.push('Row missing date field')
        continue
      }

      const date = new Date(row.date)
      if (isNaN(date.getTime())) {
        errors.push(`Invalid date: ${row.date}`)
        continue
      }

      date.setHours(0, 0, 0, 0)

      const impressions = parseInt(String(row.impressions || 0))
      const clicks = parseInt(String(row.clicks || 0))
      const cost = parseFloat(String(row.cost || 0))
      const conversions = parseFloat(String(row.conversions || 0))

      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
      const cpc = clicks > 0 ? cost / clicks : 0

      await prisma.dailyMetrics.upsert({
        where: {
          clientId_date: {
            clientId,
            date,
          },
        },
        create: {
          clientId,
          date,
          impressions,
          clicks,
          cost,
          conversions,
          ctr,
          cpc,
          source: 'CSV',
        },
        update: {
          impressions,
          clicks,
          cost,
          conversions,
          ctr,
          cpc,
          source: 'CSV',
        },
      })

      imported++
    } catch (err) {
      errors.push(`Error processing row: ${JSON.stringify(row)}`)
    }
  }

  return NextResponse.json({
    success: true,
    imported,
    errors: errors.length > 0 ? errors : undefined,
  })
}

// GET endpoint to provide CSV template info
export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    template: {
      columns: ['date', 'impressions', 'clicks', 'cost', 'conversions'],
      example: [
        {
          date: '2024-01-15',
          impressions: 5000,
          clicks: 150,
          cost: 75.50,
          conversions: 8,
        },
      ],
      notes: [
        'Date format should be YYYY-MM-DD',
        'Cost should be in your currency (e.g., MYR)',
        'Existing data for the same date will be overwritten',
      ],
    },
  })
}
