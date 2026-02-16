'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'
import { ArrowLeft } from 'lucide-react'

interface GoogleConnection {
  id: string
  googleEmail: string
}

export default function NewClientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [connections, setConnections] = useState<GoogleConnection[]>([])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [currency, setCurrency] = useState('MYR')
  const [googleConnectionId, setGoogleConnectionId] = useState('')
  const [googleCustomerId, setGoogleCustomerId] = useState('')

  useEffect(() => {
    fetch('/api/google/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConnections(data)
        }
      })
      .catch(() => { })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        companyName,
        monthlyBudget: parseFloat(monthlyBudget) || 0,
        currency,
        googleConnectionId: googleConnectionId || null,
        googleCustomerId: googleCustomerId || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to create client')
      setSaving(false)
      return
    }

    router.push('/admin/clients')
  }

  return (
    <PortalLayout title="Add New Client" role="ADMIN">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/admin/clients')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clients
        </Button>
      </div>

      <StaggerContainer className="max-w-2xl">
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company Sdn Bhd"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Login Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Initial Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Monthly Budget</label>
                    <Input
                      type="number"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      placeholder="5000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full h-10 px-3 mt-1 border border-gray-200 rounded-md bg-white"
                    >
                      <option value="MYR">MYR (Malaysian Ringgit)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="SGD">SGD (Singapore Dollar)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Google Ads Connection (Optional)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Google Account</label>
                      <select
                        value={googleConnectionId}
                        onChange={(e) => setGoogleConnectionId(e.target.value)}
                        className="w-full h-10 px-3 mt-1 border border-gray-200 rounded-md bg-white"
                      >
                        <option value="">Select account...</option>
                        {connections.map((conn) => (
                          <option key={conn.id} value={conn.id}>
                            {conn.googleEmail}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Google Ads Customer ID
                      </label>
                      <Input
                        value={googleCustomerId}
                        onChange={(e) => setGoogleCustomerId(e.target.value)}
                        placeholder="123-456-7890"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Connect to automatically sync campaign data and metrics from Google Ads.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    {saving ? 'Creating...' : 'Create Client'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/clients')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </PortalLayout>
  )
}
