import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'
import { Bell, Check, AlertTriangle, AlertCircle, Info } from 'lucide-react'

async function getAlerts() {
  return prisma.alert.findMany({
    include: { client: { select: { id: true, companyName: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { filter } = await searchParams
  const allAlerts = await getAlerts()
  const unreadCount = allAlerts.filter((a) => !a.isRead).length

  const alerts =
    filter === 'unread'
      ? allAlerts.filter((a) => !a.isRead)
      : filter === 'critical'
        ? allAlerts.filter((a) => a.severity === 'CRITICAL')
        : allAlerts

  const severityIcons = {
    CRITICAL: <AlertCircle className="w-5 h-5 text-red-500" />,
    HIGH: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    MEDIUM: <Info className="w-5 h-5 text-cyan-500" />,
    LOW: <Info className="w-5 h-5 text-gray-400" />,
  }

  const severityColors = {
    CRITICAL: 'border-red-200 bg-red-50',
    HIGH: 'border-yellow-200 bg-yellow-50',
    MEDIUM: 'border-cyan-200 bg-cyan-50',
    LOW: 'border-gray-200 bg-gray-50',
  }

  return (
    <PortalLayout
      title="Alerts"
      subtitle={`${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''}`}
      role="ADMIN"
      alertCount={unreadCount}
    >
      <StaggerContainer>
        {/* Actions */}
        <StaggerItem className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Link href="/admin/alerts">
              <Button variant={!filter ? 'outline' : 'ghost'} size="sm">
                All
              </Button>
            </Link>
            <Link href="/admin/alerts?filter=unread">
              <Button variant={filter === 'unread' ? 'outline' : 'ghost'} size="sm">
                Unread ({unreadCount})
              </Button>
            </Link>
            <Link href="/admin/alerts?filter=critical">
              <Button variant={filter === 'critical' ? 'outline' : 'ghost'} size="sm">
                Critical
              </Button>
            </Link>
          </div>
          {unreadCount > 0 && (
            <MarkAllReadButton />
          )}
        </StaggerItem>

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <StaggerItem>
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Alerts
                  </h3>
                  <p className="text-gray-500">
                    You're all caught up! Alerts will appear here when there are
                    budget warnings or performance issues.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          ) : (
            alerts.map((alert) => (
              <StaggerItem key={alert.id}>
                <Card
                  className={`border ${alert.isRead
                    ? 'border-gray-200 bg-white'
                    : severityColors[alert.severity as keyof typeof severityColors] ||
                    'border-gray-200 bg-white'
                    }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        {severityIcons[alert.severity as keyof typeof severityIcons] || (
                          <Info className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/admin/clients/${alert.clientId}`}
                            className="font-medium text-gray-900 hover:text-cyan-600"
                          >
                            {alert.client.companyName}
                          </Link>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${alert.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : alert.severity === 'HIGH'
                                ? 'bg-yellow-100 text-yellow-700'
                                : alert.severity === 'MEDIUM'
                                  ? 'bg-cyan-100 text-cyan-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                          >
                            {alert.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!alert.isRead && (
                        <MarkReadButton alertId={alert.id} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))
          )}
        </div>
      </StaggerContainer>
    </PortalLayout>
  )
}

async function MarkReadButton({ alertId }: { alertId: string }) {
  return (
    <form
      action={async () => {
        'use server'
        await prisma.alert.update({
          where: { id: alertId },
          data: { isRead: true },
        })
      }}
    >
      <Button type="submit" variant="ghost" size="sm" className="flex-shrink-0">
        <Check className="w-4 h-4" />
      </Button>
    </form>
  )
}

async function MarkAllReadButton() {
  return (
    <form
      action={async () => {
        'use server'
        await prisma.alert.updateMany({
          where: { isRead: false },
          data: { isRead: true },
        })
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        <Check className="w-4 h-4 mr-1" /> Mark All Read
      </Button>
    </form>
  )
}
