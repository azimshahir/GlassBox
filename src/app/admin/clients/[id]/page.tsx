'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Client {
  id: number
  companyName: string
  totalBudget: number
  status: string
  notes: string | null
  user: { email: string }
}

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [totalBudget, setTotalBudget] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setClient(data)
        setCompanyName(data.companyName)
        setTotalBudget(data.totalBudget.toString())
        setStatus(data.status)
        setNotes(data.notes || '')
        setLoading(false)
      })
  }, [params.id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await fetch(`/api/clients/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName,
        totalBudget: parseFloat(totalBudget),
        status,
        notes,
      }),
    })

    setSaving(false)
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            ← Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Edit Client</h1>
          <p className="text-sm text-gray-500">{client?.user.email}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Company Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Monthly Budget (RM)</label>
                <Input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-md"
                >
                  <option value="ACTIVE">Active (Green)</option>
                  <option value="LEARNING">Learning (Yellow)</option>
                  <option value="PAUSED">Paused (Red)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Weekly Notes (Plain English)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  placeholder="e.g., Minggu ni kita fokus target area KL..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Daily Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Add daily ad performance data for this client.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/admin/clients/${params.id}/metrics`)}
            >
              + Add Today's Metrics
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
