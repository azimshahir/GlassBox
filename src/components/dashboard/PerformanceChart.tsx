'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DataPoint {
  date: string
  clicks: number
  conversions: number
  impressions?: number
  cost?: number
}

interface PerformanceChartProps {
  data: DataPoint[]
  showImpressions?: boolean
  title?: string
  subtitle?: string
}

export function PerformanceChart({
  data,
  showImpressions = false,
  title = 'Performance Trend',
  subtitle = 'Overview of your campaign metrics',
}: PerformanceChartProps) {
  const [activeMetric, setActiveMetric] = useState<'clicks' | 'conversions' | 'impressions'>('clicks')

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
  }

  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`
    }
    return value.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate as any}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={formatNumber}
                  dx={10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px var(--shadow-color)',
                  }}
                  itemStyle={{ color: 'var(--popover-foreground)', fontWeight: 500 }}
                  labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '8px' }}
                  labelFormatter={formatDate as any}
                  formatter={(value: any) => [(value ?? 0).toLocaleString(), '']}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  content={({ payload }) => (
                    <div className="flex justify-center gap-6 text-sm">
                      {payload?.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-muted-foreground font-medium">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "var(--chart-1)" }}
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  name="Conversions"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorConversions)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "var(--chart-2)" }}
                />
                {showImpressions && (
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    name="Impressions"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorImpressions)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "var(--chart-3)" }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
