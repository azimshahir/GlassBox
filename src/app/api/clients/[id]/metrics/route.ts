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
      clientId: parseInt(id),
      date: new Date(body.date),
      spend: body.spend,
      impressions: body.impressions,
      clicks: body.clicks,
      conversions: body.conversions,
    },
  })

  return NextResponse.json(metric)
}
