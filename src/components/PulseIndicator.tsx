'use client'

type Status = 'ACTIVE' | 'LEARNING' | 'PAUSED'

interface PulseIndicatorProps {
  status: Status
}

const statusConfig = {
  ACTIVE: {
    color: 'bg-green-500',
    label: 'Optimized',
    description: 'Ads running smoothly',
  },
  LEARNING: {
    color: 'bg-yellow-500',
    label: 'Learning',
    description: 'Campaign being tuned',
  },
  PAUSED: {
    color: 'bg-red-500',
    label: 'Attention',
    description: 'Budget depleted or paused',
  },
}

export function PulseIndicator({ status }: PulseIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        <div
          className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping opacity-75`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{config.label}</p>
        <p className="text-xs text-gray-500">{config.description}</p>
      </div>
    </div>
  )
}
