import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import {
  MetricCard,
  BudgetPacing,
  PerformanceChart,
  CampaignTable,
  WeeklySummary,
  StatusIndicator,
  DateRangeFilter,
} from '@/components/dashboard'
import { DollarSign, Eye, MousePointer, Target } from 'lucide-react'
import { ClientDashboardWrapper } from './ClientDashboardWrapper'

async function getDashboardData(clientId: string, days: number) {
  const now = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      dailyMetrics: {
        where: { date: { gte: startDate } },
        orderBy: { date: 'asc' },
      },
      campaigns: {
        include: {
          metrics: {
            where: { date: { gte: startDate } },
          },
        },
      },
    },
  })

  if (!client) return null

  const metrics = client.dailyMetrics
  const totalSpend = metrics.reduce((sum, m) => sum + m.cost, 0)
  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0)
  const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0)
  const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0)

  // Calculate changes (compare to previous period)
  const prevStartDate = new Date(startDate)
  prevStartDate.setDate(prevStartDate.getDate() - days)

  const prevMetrics = await prisma.dailyMetrics.findMany({
    where: {
      clientId,
      date: { gte: prevStartDate, lt: startDate },
    },
  })

  const prevSpend = prevMetrics.reduce((sum, m) => sum + m.cost, 0)
  const prevClicks = prevMetrics.reduce((sum, m) => sum + m.clicks, 0)
  const prevConversions = prevMetrics.reduce((sum, m) => sum + m.conversions, 0)

  const spendChange = prevSpend > 0 ? ((totalSpend - prevSpend) / prevSpend) * 100 : 0
  const clicksChange = prevClicks > 0 ? ((totalClicks - prevClicks) / prevClicks) * 100 : 0
  const conversionsChange = prevConversions > 0 ? ((totalConversions - prevConversions) / prevConversions) * 100 : 0

  const chartData = metrics.map((m) => ({
    date: m.date.toISOString().split('T')[0],
    clicks: m.clicks,
    conversions: m.conversions,
    impressions: m.impressions,
  }))

  // Aggregate campaign data
  const campaignData = client.campaigns.map((camp) => {
    const campMetrics = camp.metrics
    return {
      id: camp.id,
      name: camp.name,
      status: camp.status,
      channelType: camp.channelType,
      spend: campMetrics.reduce((s, m) => s + m.cost, 0),
      clicks: campMetrics.reduce((s, m) => s + m.clicks, 0),
      conversions: campMetrics.reduce((s, m) => s + m.conversions, 0),
      roas: campMetrics.length > 0
        ? campMetrics.reduce((s, m) => s + m.conversions * 50, 0) / campMetrics.reduce((s, m) => s + m.cost, 0) || 0
        : 0,
    }
  }).sort((a, b) => b.spend - a.spend)

  // Get days remaining in month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth = now.getDate()
  const daysRemaining = daysInMonth - dayOfMonth

  return {
    client,
    totalSpend,
    totalClicks,
    totalImpressions,
    totalConversions,
    spendChange,
    clicksChange,
    conversionsChange,
    chartData,
    campaignData,
    daysRemaining,
  }
}

export default async function ClientDashboard({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.clientId) {
    return (
      <PortalLayout title="Dashboard" role="CLIENT">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No client profile found.</p>
        </div>
      </PortalLayout>
    )
  }

  const params = await searchParams
  const days = parseInt(params.days || '30')
  const data = await getDashboardData(session.user.clientId, days)

  if (!data) {
    return (
      <PortalLayout title="Dashboard" role="CLIENT">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data available.</p>
        </div>
      </PortalLayout>
    )
  }

  const {
    client,
    totalSpend,
    totalClicks,
    totalImpressions,
    totalConversions,
    spendChange,
    clicksChange,
    conversionsChange,
    chartData,
    campaignData,
    daysRemaining,
  } = data

  return (
    <ClientDashboardWrapper
      companyName={client.companyName}
      status={client.status}
      currency={client.currency}
      monthlyBudget={client.monthlyBudget}
      notes={client.notes}
      totalSpend={totalSpend}
      totalClicks={totalClicks}
      totalImpressions={totalImpressions}
      totalConversions={totalConversions}
      spendChange={spendChange}
      clicksChange={clicksChange}
      conversionsChange={conversionsChange}
      chartData={chartData}
      campaignData={campaignData}
      daysRemaining={daysRemaining}
      currentDays={days}
    />
  )
}
