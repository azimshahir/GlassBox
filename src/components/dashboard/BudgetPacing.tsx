'use client'

import { cn } from '@/lib/utils'

interface BudgetPacingProps {
  spent: number
  budget: number
  currency?: string
  daysRemaining?: number
}

export function BudgetPacing({
  spent,
  budget,
  currency = 'RM',
  daysRemaining,
}: BudgetPacingProps) {
  const percentage = Math.min((spent / budget) * 100, 100)
  const projectedSpend = daysRemaining
    ? spent + (spent / (30 - daysRemaining)) * daysRemaining
    : spent

  const status =
    percentage >= 100
      ? 'critical'
      : percentage >= 90
        ? 'warning'
        : percentage >= 80
          ? 'caution'
          : 'good'

  const statusConfig = {
    critical: {
      color: 'bg-red-500',
      textColor: 'text-red-600',
      label: 'Over budget',
    },
    warning: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      label: 'Nearing limit',
    },
    caution: {
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      label: 'On track',
    },
    good: {
      color: 'bg-green-500',
      textColor: 'text-green-600',
      label: 'On track',
    },
  }

  const config = statusConfig[status]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Budget Pacing</h3>
        <span
          className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            status === 'critical' && 'bg-red-100 text-red-700',
            status === 'warning' && 'bg-yellow-100 text-yellow-700',
            status === 'caution' && 'bg-cyan-100 text-cyan-700',
            status === 'good' && 'bg-green-100 text-green-700'
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className={cn('h-full rounded-full transition-all duration-500', config.color)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        {/* Warning markers */}
        <div className="absolute top-0 left-[80%] w-px h-full bg-gray-300" />
        <div className="absolute top-0 left-[90%] w-px h-full bg-gray-300" />
      </div>

      {/* Numbers */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            {currency}
            {spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-gray-400 ml-1">
            / {currency}
            {budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
        <span className={cn('text-lg font-semibold', config.textColor)}>
          {percentage.toFixed(1)}%
        </span>
      </div>

      {/* Additional Info */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        {daysRemaining !== undefined && (
          <span>{daysRemaining} days remaining</span>
        )}
        {projectedSpend > budget && daysRemaining !== undefined && (
          <span className="text-yellow-600">
            Projected: {currency}
            {projectedSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        )}
      </div>
    </div>
  )
}
