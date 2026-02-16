import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const metric = await prisma.dailyMetrics.create({
    data: {
      clientId: id,
      date: new Date(body.date),
      cost: body.cost ?? body.spend ?? 0,
      impressions: body.impressions ?? 0,
      clicks: body.clicks ?? 0,
      conversions: body.conversions ?? 0,
      source: 'MANUAL',
    },
  })

  return NextResponse.json(metric)
}
