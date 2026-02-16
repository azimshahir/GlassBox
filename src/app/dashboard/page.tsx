import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PulseIndicator } from '@/components/PulseIndicator'
import { BurnRateBar } from '@/components/BurnRateBar'
import { ContextCard } from '@/components/ContextCard'
import { StatsCard } from '@/components/StatsCard'
import { MetricsChart } from '@/components/MetricsChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardClient } from './DashboardClient'

async function getDashboardData(userId: number, days: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      client: {
        include: {
          metrics: {
            orderBy: { date: 'desc' },
            take: days,
          },
        },
      },
    },
  })

  if (!user?.client) return null

  const client = user.client
  const metrics = client.metrics.reverse()
  const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0)
  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0)
  const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0)
  const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0)

  const chartData = metrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }),
    clicks: m.clicks,
    impressions: m.impressions,
  }))

  return { client, totalSpend, totalClicks, totalImpressions, totalConversions, chartData }
}

export default async function ClientDashboard({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) redirect('/login')

  const params = await searchParams
  const days = parseInt(params.days || '14')
  const data = await getDashboardData(parseInt(userId), days)

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No client data found.</p>
      </div>
    )
  }

  const { client, totalSpend, totalClicks, totalImpressions, totalConversions, chartData } = data

  return (
    <DashboardClient
      client={{
        companyName: client.companyName,
        status: client.status as 'ACTIVE' | 'LEARNING' | 'PAUSED',
        notes: client.notes,
        totalBudget: client.totalBudget,
      }}
      metrics={{ totalSpend, totalClicks, totalImpressions, totalConversions }}
      chartData={chartData}
      currentDays={days}
    />
  )
}
