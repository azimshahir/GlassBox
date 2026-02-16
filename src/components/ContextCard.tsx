'use client'

import { Card, CardContent } from '@/components/ui/card'

interface ContextCardProps {
  notes: string | null
}

export function ContextCard({ notes }: ContextCardProps) {
  if (!notes) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="pt-4">
          <p className="text-sm text-gray-400 italic">
            No updates this week yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-cyan-50 border-cyan-200">
      <CardContent className="pt-4">
        <div className="flex gap-2">
          <span className="text-cyan-600 text-lg">💡</span>
          <p className="text-sm text-gray-700 leading-relaxed">{notes}</p>
        </div>
      </CardContent>
    </Card>
  )
}
