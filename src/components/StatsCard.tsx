'use client'

import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
}

export function StatsCard({ title, value, subtitle }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
