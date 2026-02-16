'use client'

import { Progress } from '@/components/ui/progress'

interface BurnRateBarProps {
  spent: number
  budget: number
}

export function BurnRateBar({ spent, budget }: BurnRateBarProps) {
  const percentage = Math.min((spent / budget) * 100, 100)
  const remaining = budget - spent

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Budget Used</span>
        <span className="font-medium text-gray-900">
          {percentage.toFixed(0)}%
        </span>
      </div>
      <Progress value={percentage} className="h-3" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>RM{spent.toLocaleString()} spent</span>
        <span>RM{remaining.toLocaleString()} remaining</span>
      </div>
    </div>
  )
}
