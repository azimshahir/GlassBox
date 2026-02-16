'use client'

import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  status: 'ACTIVE' | 'LEARNING' | 'PAUSED' | string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  ACTIVE: {
    color: 'bg-green-500',
    ringColor: 'ring-green-500/30',
    label: 'Active',
    description: 'Campaign is running optimally',
  },
  LEARNING: {
    color: 'bg-yellow-500',
    ringColor: 'ring-yellow-500/30',
    label: 'Learning',
    description: 'AI is optimizing your ads',
  },
  PAUSED: {
    color: 'bg-gray-400',
    ringColor: 'ring-gray-400/30',
    label: 'Paused',
    description: 'Campaign is currently paused',
  },
}

export function StatusIndicator({
  status,
  showLabel = true,
  size = 'md',
}: StatusIndicatorProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'bg-gray-400',
    ringColor: 'ring-gray-400/30',
    label: status,
    description: '',
  }

  const sizes = {
    sm: { dot: 'w-2 h-2', ring: 'w-4 h-4' },
    md: { dot: 'w-3 h-3', ring: 'w-5 h-5' },
    lg: { dot: 'w-4 h-4', ring: 'w-6 h-6' },
  }

  const sizeConfig = sizes[size]

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            sizeConfig.ring,
            'rounded-full ring-4 animate-pulse',
            config.ringColor
          )}
        />
        <div
          className={cn(
            sizeConfig.dot,
            'absolute rounded-full',
            config.color
          )}
        />
      </div>
      {showLabel && (
        <div>
          <span className="text-sm font-medium text-gray-900">{config.label}</span>
          {config.description && (
            <p className="text-xs text-gray-500">{config.description}</p>
          )}
        </div>
      )}
    </div>
  )
}
