'use client'

import { useState } from 'react'

export function MccField({ connectionId, currentMcc }: { connectionId: string; currentMcc: string | null }) {
  const [editing, setEditing] = useState(false)
  const [mcc, setMcc] = useState(currentMcc || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch('/api/google/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId, mccAccountId: mcc }),
    })
    setSaving(false)
    setEditing(false)
    window.location.reload()
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <input
          type="text"
          value={mcc}
          onChange={(e) => setMcc(e.target.value)}
          placeholder="e.g. 738-637-5435"
          className="px-2 py-1 text-sm border border-gray-300 rounded w-40"
        />
        <button onClick={handleSave} disabled={saving} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">
          Cancel
        </button>
      </div>
    )
  }

  return (
    <p className="text-sm text-gray-500">
      {currentMcc ? `MCC: ${currentMcc}` : 'No MCC configured'}
      {' '}
      <button onClick={() => setEditing(true)} className="text-cyan-500 hover:text-cyan-600 text-xs font-medium">
        {currentMcc ? 'Edit' : 'Set MCC'}
      </button>
    </p>
  )
}
