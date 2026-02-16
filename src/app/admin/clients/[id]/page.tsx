'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { MetricCard, BudgetPacing, PerformanceChart, CampaignTable, WeeklySummary } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'
import { RefreshCw, ArrowLeft, Eye, MousePointer, DollarSign, Target } from 'lucide-react'

interface Client {
  id: string
  companyName: string
  monthlyBudget: number
  currency: string
  status: string
  notes: string | null
  googleCustomerId: string | null
  googleConnectionId: string | null
  user: { email: string; name: string | null } | null
  campaigns: Array<{
    id: string
    name: string
    status: string
    channelType: string
    metrics: Array<{
      cost: number
      clicks: number
      conversions: number
    }>
  }>
  dailyMetrics: Array<{
    date: string
    impressions: number
    clicks: number
    cost: number
    conversions: number
  }>
}

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'edit'>('overview')

  const [companyName, setCompanyName] = useState('')
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchClient()
  }, [params.id])

  async function fetchClient() {
    const res = await fetch(`/api/clients/${params.id}`)
    const data = await res.json()
    setClient(data)
    setCompanyName(data.companyName)
    setMonthlyBudget(data.monthlyBudget.toString())
    setStatus(data.status)
    setNotes(data.notes || '')
    setLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await fetch(`/api/clients/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName,
        monthlyBudget: parseFloat(monthlyBudget),
        status,
        notes,
      }),
    })

    setSaving(false)
    fetchClient()
    setActiveTab('overview')
  }

  async function handleSync() {
    if (!client?.googleConnectionId) return
    setSyncing(true)

    await fetch('/api/sync/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id }),
    })

    setSyncing(false)
    fetchClient()
  }

  if (loading || !client) {
    return (
      <PortalLayout title="Loading..." role="ADMIN">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading client data...</p>
        </div>
      </PortalLayout>
    )
  }

  const totalSpend = client.dailyMetrics.reduce((s, m) => s + m.cost, 0)
  const totalClicks = client.dailyMetrics.reduce((s, m) => s + m.clicks, 0)
  const totalImpressions = client.dailyMetrics.reduce((s, m) => s + m.impressions, 0)
  const totalConversions = client.dailyMetrics.reduce((s, m) => s + m.conversions, 0)

  const chartData = client.dailyMetrics.map((m) => ({
    date: m.date,
    clicks: m.clicks,
    conversions: m.conversions,
  }))

  const campaignData = client.campaigns.map((c) => {
    const spend = c.metrics.reduce((s, m) => s + m.cost, 0)
    const clicks = c.metrics.reduce((s, m) => s + m.clicks, 0)
    const conversions = c.metrics.reduce((s, m) => s + m.conversions, 0)
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      channelType: c.channelType,
      spend,
      clicks,
      conversions,
      roas: spend > 0 ? parseFloat((conversions / spend * 100).toFixed(1)) : 0,
    }
  })

  return (
    <PortalLayout
      title={client.companyName}
      subtitle={client.user?.email || 'No user assigned'}
      role="ADMIN"
    >
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.push('/admin/clients')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clients
        </Button>
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('edit')}
          >
            Edit
          </Button>
        </div>
        {client.googleConnectionId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </Button>
        )}
      </div>

      {activeTab === 'overview' ? (
        <StaggerContainer>
          {/* Quick Stats */}
          <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total Spend"
              value={totalSpend.toFixed(0)}
              prefix={client.currency}
              icon={<DollarSign className="w-5 h-5 text-gray-600" />}
            />
            <MetricCard
              title="Impressions"
              value={totalImpressions}
              icon={<Eye className="w-5 h-5 text-gray-600" />}
            />
            <MetricCard
              title="Clicks"
              value={totalClicks}
              icon={<MousePointer className="w-5 h-5 text-gray-600" />}
            />
            <MetricCard
              title="Conversions"
              value={totalConversions}
              icon={<Target className="w-5 h-5 text-gray-600" />}
            />
          </StaggerItem>

          {/* Budget & Summary */}
          <StaggerItem className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <BudgetPacing
              spent={totalSpend}
              budget={client.monthlyBudget}
              currency={client.currency}
              daysRemaining={15}
            />
            <WeeklySummary
              notes={client.notes}
              isAdmin={true}
              onEdit={() => setActiveTab('edit')}
            />
          </StaggerItem>

          {/* Chart */}
          {chartData.length > 0 && (
            <StaggerItem className="mb-6">
              <PerformanceChart data={chartData} title="Performance (Last 30 Days)" />
            </StaggerItem>
          )}

          {/* Campaigns */}
          {campaignData.length > 0 && (
            <StaggerItem>
              <CampaignTable campaigns={campaignData} currency={client.currency} />
            </StaggerItem>
          )}
        </StaggerContainer>
      ) : (
        /* Edit Form */
        <StaggerContainer className="max-w-2xl">
          <StaggerItem>
            <Card>
              <CardHeader>
                <CardTitle>Edit Client Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Monthly Budget ({client.currency})
                    </label>
                    <Input
                      type="number"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-10 px-3 mt-1 border border-gray-200 rounded-md bg-white"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="LEARNING">Learning</option>
                      <option value="PAUSED">Paused</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Weekly Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 mt-1 border border-gray-200 rounded-md"
                      placeholder="Write a plain English summary for your client..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be shown to the client on their dashboard
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving} className="bg-cyan-500 hover:bg-cyan-600">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('overview')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Manual Metrics Entry */}
          <StaggerItem className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Data Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Add daily metrics manually if Google Ads is not connected.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/clients/${params.id}/metrics`)}
                >
                  + Add Today's Metrics
                </Button>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      )}
    </PortalLayout>
  )
}
