'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NewClientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [totalBudget, setTotalBudget] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        companyName,
        totalBudget: parseFloat(totalBudget),
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to create client')
      setSaving(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            ← Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Add New Client</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Client Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Initial password"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Company Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Sdn Bhd"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Monthly Budget (RM)</label>
                <Input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="5000"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Creating...' : 'Create Client'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
