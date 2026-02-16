'use client'

import { useRouter } from 'next/navigation'
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
import { DollarSign, Eye, MousePointer, Target, Settings2, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface Campaign {
  id: string
  name: string
  status: string
  channelType: string
  spend: number
  clicks: number
  conversions: number
  roas: number
}

interface ChartDataPoint {
  date: string
  clicks: number
  conversions: number
  impressions?: number
}

interface Props {
  companyName: string
  status: string
  currency: string
  monthlyBudget: number
  notes: string | null
  totalSpend: number
  totalClicks: number
  totalImpressions: number
  totalConversions: number
  spendChange: number
  clicksChange: number
  conversionsChange: number
  chartData: ChartDataPoint[]
  campaignData: Campaign[]
  daysRemaining: number
  currentDays: number
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function ClientDashboardWrapper({
  companyName,
  status,
  currency,
  monthlyBudget,
  notes,
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
  currentDays,
}: Props) {
  const router = useRouter()

  const handleDaysChange = (days: number) => {
    router.push(`/dashboard?days=${days}`)
  }

  return (
    <PortalLayout title="Dashboard" subtitle="Overview of your advertising performance" role="CLIENT" clientName={companyName}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header Controls */}
        <motion.div variants={item} className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <StatusIndicator status={status} />
            <div className="h-6 w-[1px] bg-border hidden sm:block" />
            <span className="text-sm text-muted-foreground hidden sm:block">Last updated: Just now</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DateRangeFilter value={currentDays} onChange={handleDaysChange} />
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Settings2 className="w-4 h-4" /> Customize
            </Button>
          </div>
        </motion.div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <MetricCard
            title="Total Spend"
            value={totalSpend.toFixed(0)}
            prefix={currency}
            change={spendChange}
            changeLabel="vs prev period"
            icon={<DollarSign className="w-5 h-5" />}
            delay={0.1}
          />
          <MetricCard
            title="Impressions"
            value={totalImpressions}
            icon={<Eye className="w-5 h-5" />}
            delay={0.2}
          />
          <MetricCard
            title="Clicks"
            value={totalClicks}
            change={clicksChange}
            changeLabel="vs prev period"
            icon={<MousePointer className="w-5 h-5" />}
            delay={0.3}
          />
          <MetricCard
            title="Conversions"
            value={totalConversions}
            change={conversionsChange}
            changeLabel="vs prev period"
            icon={<Target className="w-5 h-5" />}
            delay={0.4}
          />
        </div>

        {/* Main Content Grid: Chart + Budget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section - Takes up 2/3 on large screens */}
          <motion.div variants={item} className="lg:col-span-2">
            {chartData.length > 0 ? (
              <PerformanceChart
                data={chartData}
                title="Performance Overview"
                subtitle={`Clicks and conversions over the last ${currentDays} days`}
              />
            ) : (
              <div className="h-[400px] bg-card rounded-xl border border-border flex items-center justify-center text-muted-foreground">
                No chart data available
              </div>
            )}
          </motion.div>

          {/* Side Widgets - Takes up 1/3 */}
          <motion.div variants={item} className="space-y-6">
            <BudgetPacing
              spent={totalSpend}
              budget={monthlyBudget}
              currency={currency}
              daysRemaining={daysRemaining}
            />
            <WeeklySummary notes={notes} />
          </motion.div>
        </div>

        {/* Bottom Section: Campaigns Table */}
        <motion.div variants={item}>
          {campaignData.length > 0 && (
            <CampaignTable campaigns={campaignData} currency={currency} />
          )}
        </motion.div>
      </motion.div>
    </PortalLayout>
  )
}
