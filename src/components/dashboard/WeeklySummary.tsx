'use client'

import { MessageSquare, Edit2 } from 'lucide-react'

interface WeeklySummaryProps {
  notes: string | null
  onEdit?: () => void
  isAdmin?: boolean
}

export function WeeklySummary({ notes, onEdit, isAdmin = false }: WeeklySummaryProps) {
  return (
    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl border border-cyan-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-600" />
          <h3 className="text-sm font-medium text-cyan-900">Weekly Summary</h3>
        </div>
        {isAdmin && onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-cyan-200 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4 text-cyan-600" />
          </button>
        )}
      </div>

      {notes ? (
        <p className="text-gray-700 leading-relaxed">{notes}</p>
      ) : (
        <p className="text-gray-400 italic">
          {isAdmin
            ? 'Click edit to add weekly notes for your client...'
            : 'No summary available yet. Check back soon!'}
        </p>
      )}
    </div>
  )
}
