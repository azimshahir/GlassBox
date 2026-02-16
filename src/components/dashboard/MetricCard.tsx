'use client'

import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface MetricCardProps {
  title: string
  value: string | number
  prefix?: string
  suffix?: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  delay?: number
}

export function MetricCard({
  title,
  value,
  prefix = '',
  suffix = '',
  change,
  changeLabel = 'vs last period',
  icon,
  trend,
  delay = 0,
}: MetricCardProps) {
  const displayTrend = trend || (change === undefined ? 'neutral' : change > 0 ? 'up' : change < 0 ? 'down' : 'neutral')

  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-rose-500',
    neutral: 'text-gray-400',
  }

  const TrendIcon = displayTrend === 'up' ? ArrowUp : displayTrend === 'down' ? ArrowDown : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="bg-card border-border hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          {icon && <div className="scale-[2.5]">{icon}</div>}
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {icon}
              </div>
              {change !== undefined && (
                <div className={cn("flex items-center gap-1 text-sm font-medium", trendColors[displayTrend])}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{Math.abs(change).toFixed(1)}%</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              <div className="flex items-baseline gap-1">
                {prefix && <span className="text-lg font-medium text-muted-foreground/80">{prefix}</span>}
                <span className="text-3xl font-bold text-foreground tracking-tight">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
                {suffix && <span className="text-lg font-medium text-muted-foreground/80">{suffix}</span>}
              </div>
            </div>

            {changeLabel && change !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className={cn("font-medium", trendColors[displayTrend])}>
                  {displayTrend === 'up' ? '+' : displayTrend === 'down' ? '-' : ''}
                  {Math.abs(change).toFixed(1)}%
                </span>{' '}
                {changeLabel}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
