'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'

export default function AddMetricsPage() {
  const params = useParams()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [spend, setSpend] = useState('')
  const [impressions, setImpressions] = useState('')
  const [clicks, setClicks] = useState('')
  const [conversions, setConversions] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await fetch(`/api/clients/${params.id}/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        spend: parseFloat(spend),
        impressions: parseInt(impressions),
        clicks: parseInt(clicks),
        conversions: parseInt(conversions),
      }),
    })

    setSaving(false)
    router.push(`/admin/clients/${params.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            ← Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Add Daily Metrics</h1>
          <p className="text-sm text-gray-500">Enter today's ad performance data</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <StaggerContainer>
          <StaggerItem>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metrics Data</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Date</label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Spend (RM)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={spend}
                        onChange={(e) => setSpend(e.target.value)}
                        placeholder="150.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Impressions</label>
                      <Input
                        type="number"
                        value={impressions}
                        onChange={(e) => setImpressions(e.target.value)}
                        placeholder="5000"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Clicks</label>
                      <Input
                        type="number"
                        value={clicks}
                        onChange={(e) => setClicks(e.target.value)}
                        placeholder="100"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Conversions (Leads)</label>
                      <Input
                        type="number"
                        value={conversions}
                        onChange={(e) => setConversions(e.target.value)}
                        placeholder="5"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Metrics'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </main>
    </div>
  )
}
