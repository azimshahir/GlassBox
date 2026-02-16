'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { PulseIndicator } from '@/components/PulseIndicator'
import { BurnRateBar } from '@/components/BurnRateBar'
import { ContextCard } from '@/components/ContextCard'
import { StatsCard } from '@/components/StatsCard'
import { MetricsChart } from '@/components/MetricsChart'
import { DateFilter } from '@/components/DateFilter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardClientProps {
  client: {
    companyName: string
    status: 'ACTIVE' | 'LEARNING' | 'PAUSED'
    notes: string | null
    totalBudget: number
  }
  metrics: {
    totalSpend: number
    totalClicks: number
    totalImpressions: number
    totalConversions: number
  }
  chartData: { date: string; clicks: number; impressions: number }[]
  currentDays: number
}

export function DashboardClient({ client, metrics, chartData, currentDays }: DashboardClientProps) {
  const router = useRouter()

  function handleDateChange(days: number) {
    router.push(`/dashboard?days=${days}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={client.companyName} subtitle="Ad Performance Dashboard">
        <PulseIndicator status={client.status} />
      </Header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <ContextCard notes={client.notes} />
        </div>

        <div className="flex justify-end">
          <DateFilter value={currentDays} onChange={handleDateChange} />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Monthly Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <BurnRateBar spent={metrics.totalSpend} budget={client.totalBudget} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Total Spend" value={`RM${metrics.totalSpend.toLocaleString()}`} subtitle="This period" />
          <StatsCard title="Impressions" value={metrics.totalImpressions.toLocaleString()} subtitle="People reached" />
          <StatsCard title="Clicks" value={metrics.totalClicks.toLocaleString()} subtitle="Potential customers" />
          <StatsCard title="Conversions" value={metrics.totalConversions} subtitle="Leads generated" />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricsChart data={chartData} />
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <p className="text-xs text-gray-400 text-center">GlassBox - Your Marketing, Demystified</p>
        </div>
      </footer>
    </div>
  )
}
