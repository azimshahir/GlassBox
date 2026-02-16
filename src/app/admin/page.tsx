import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { MetricCard, StatusIndicator } from '@/components/dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, TrendingUp, AlertTriangle, Plus, RefreshCw } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'

async function getDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [clients, totalAlerts, connections] = await Promise.all([
    prisma.client.findMany({
      include: {
        dailyMetrics: {
          where: { date: { gte: startOfMonth } },
          orderBy: { date: 'desc' },
        },
        campaigns: true,
        _count: { select: { alerts: { where: { isRead: false } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.alert.count({ where: { isRead: false } }),
    prisma.googleConnection.findMany({
      select: {
        id: true,
        googleEmail: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        isActive: true,
      },
    }),
  ])

  const totalSpend = clients.reduce(
    (sum, c) => sum + c.dailyMetrics.reduce((s, m) => s + m.cost, 0),
    0
  )
  const totalBudget = clients.reduce((sum, c) => sum + c.monthlyBudget, 0)
  const totalConversions = clients.reduce(
    (sum, c) => sum + c.dailyMetrics.reduce((s, m) => s + m.conversions, 0),
    0
  )

  return { clients, totalAlerts, connections, totalSpend, totalBudget, totalConversions }
}

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { clients, totalAlerts, connections, totalSpend, totalBudget, totalConversions } =
    await getDashboardData()

  return (
    <PortalLayout title="Overview" subtitle="Admin Dashboard" role="ADMIN" alertCount={totalAlerts}>
      <StaggerContainer className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            <MetricCard
              title="Total Clients"
              value={clients.length}
              icon={<Users className="w-5 h-5" />}
            />
          </StaggerItem>
          <StaggerItem>
            <MetricCard
              title="Monthly Spend"
              value={totalSpend.toFixed(0)}
              prefix="RM"
              icon={<DollarSign className="w-5 h-5" />}
            />
          </StaggerItem>
          <StaggerItem>
            <MetricCard
              title="Total Conversions"
              value={totalConversions}
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </StaggerItem>
          <StaggerItem>
            <MetricCard
              title="Active Alerts"
              value={totalAlerts}
              icon={<AlertTriangle className="w-5 h-5" />}
              trend={totalAlerts > 0 ? 'down' : 'neutral'}
            />
          </StaggerItem>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List */}
          <StaggerItem className="lg:col-span-2">
            <Card>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-medium text-foreground">Clients</h2>
                <Link href="/admin/clients/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Client
                  </Button>
                </Link>
              </div>
              <CardContent className="p-0">
                {clients.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No clients yet. Add your first client to get started!
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {clients.map((client) => {
                      const monthSpend = client.dailyMetrics.reduce((s, m) => s + m.cost, 0)
                      const percentage = client.monthlyBudget > 0 ? (monthSpend / client.monthlyBudget) * 100 : 0

                      return (
                        <Link
                          key={client.id}
                          href={`/admin/clients/${client.id}`}
                          className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                              {client.companyName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">{client.companyName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {client.campaigns.length} campaigns
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="hidden md:block text-right">
                              <p className="text-sm font-medium text-foreground">
                                {client.currency}
                                {monthSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                of {client.currency}
                                {client.monthlyBudget.toLocaleString()}
                              </p>
                            </div>
                            <div className="w-20 hidden sm:block">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${percentage >= 90
                                    ? 'bg-red-500'
                                    : percentage >= 80
                                      ? 'bg-yellow-500'
                                      : 'bg-primary'
                                    }`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                              </div>
                            </div>
                            <StatusIndicator
                              status={client.status}
                              showLabel={false}
                              size="sm"
                            />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Google Connections & Alerts */}
          <div className="space-y-6">
            {/* Google Accounts */}
            <StaggerItem>
              <Card>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-medium text-foreground">Google Accounts</h2>
                  <Link href="/admin/accounts">
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </Link>
                </div>
                <CardContent className="p-4">
                  {connections.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">No Google accounts connected</p>
                      <Link href="/api/google/connect">
                        <Button size="sm">
                          Connect Account
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {connections.map((conn) => (
                        <div
                          key={conn.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                              {conn.googleEmail}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {conn.lastSyncAt
                                ? `Synced ${new Date(conn.lastSyncAt).toLocaleDateString()}`
                                : 'Never synced'}
                            </p>
                          </div>
                          <span
                            className={`w-2 h-2 rounded-full ${conn.isActive && conn.lastSyncStatus === 'SUCCESS'
                              ? 'bg-emerald-500'
                              : conn.lastSyncStatus === 'FAILED'
                                ? 'bg-red-500'
                                : 'bg-muted-foreground'
                              }`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Recent Alerts */}
            <StaggerItem>
              <Card>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-medium text-foreground">Recent Alerts</h2>
                  {totalAlerts > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                      {totalAlerts} new
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <AlertsList />
                </CardContent>
              </Card>
            </StaggerItem>
          </div>
        </div>
      </StaggerContainer>
    </PortalLayout>
  )
}

async function AlertsList() {
  const alerts = await prisma.alert.findMany({
    where: { isRead: false },
    include: { client: { select: { companyName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  if (alerts.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No active alerts</p>
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3 rounded-lg border ${alert.severity === 'CRITICAL'
            ? 'bg-red-50 border-red-200'
            : alert.severity === 'HIGH'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
            }`}
        >
          <p className="text-sm font-medium text-gray-900">{alert.client.companyName}</p>
          <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
        </div>
      ))}
      {alerts.length >= 5 && (
        <Link href="/admin/alerts" className="text-sm text-cyan-600 hover:text-cyan-700 block text-center">
          View all alerts
        </Link>
      )}
    </div>
  )
}
