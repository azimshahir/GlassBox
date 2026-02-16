import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { syncClientData, checkAndCreateAlerts } from '@/lib/google-ads/sync'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Link2, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'

async function checkGoogleConfig() {
  // Check .env first, then fall back to DB settings
  const envClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? ''
  const envClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? ''
  const envDevToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() ?? ''

  if (envClientId && envClientSecret) {
    return { isGoogleConfigured: true, isAdsApiConfigured: envDevToken.length > 0 }
  }

  // Check DB settings
  const dbSettings = await prisma.settings.findMany({
    where: { key: { in: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_ADS_DEVELOPER_TOKEN'] } },
  })
  const dbMap = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]))

  const hasOAuth = (dbMap['GOOGLE_CLIENT_ID'] ?? '').length > 0 && (dbMap['GOOGLE_CLIENT_SECRET'] ?? '').length > 0
  const hasAds = (dbMap['GOOGLE_ADS_DEVELOPER_TOKEN'] ?? '').length > 0

  return { isGoogleConfigured: hasOAuth, isAdsApiConfigured: hasAds }
}

async function getConnections() {
  return prisma.googleConnection.findMany({
    include: {
      clients: { select: { id: true, companyName: true } },
      syncLogs: {
        orderBy: { startedAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AccountsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const [connections, { isGoogleConfigured, isAdsApiConfigured }] = await Promise.all([
    getConnections(),
    checkGoogleConfig(),
  ])

  return (
    <PortalLayout
      title="Google Accounts"
      subtitle="Manage your Google Ads connections"
      role="ADMIN"
    >
      <StaggerContainer>
        {/* Setup Status */}
        {!isGoogleConfigured && (
          <StaggerItem>
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Google OAuth Not Configured</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Add your Google Client ID and Client Secret in{' '}
                      <Link href="/admin/settings" className="underline font-medium">
                        Settings
                      </Link>{' '}
                      before connecting an account.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        )}

        {isGoogleConfigured && !isAdsApiConfigured && (
          <StaggerItem>
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Google Ads API Not Configured</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      OAuth is ready, but auto-sync needs a Developer Token. Add it in{' '}
                      <Link href="/admin/settings" className="underline font-medium">
                        Settings
                      </Link>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        )}

        {/* Connect Button */}
        <StaggerItem className="mb-6">
          {isGoogleConfigured ? (
            <Link href="/api/google/connect">
              <Button className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="w-4 h-4 mr-2" /> Connect Google Account
              </Button>
            </Link>
          ) : (
            <Button disabled className="opacity-50 cursor-not-allowed">
              <Plus className="w-4 h-4 mr-2" /> Connect Google Account
            </Button>
          )}
        </StaggerItem>

        {/* Connections List */}
        <div className="space-y-4">
          {connections.length === 0 ? (
            <StaggerItem>
              <Card>
                <CardContent className="py-12 text-center">
                  <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Google Accounts Connected
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {isGoogleConfigured
                      ? 'Connect your Google Ads account to automatically sync campaign data and metrics for your clients.'
                      : 'Configure your Google credentials in Settings first, then connect your account here.'}
                  </p>
                  {isGoogleConfigured && (
                    <Link href="/api/google/connect">
                      <Button className="bg-cyan-500 hover:bg-cyan-600">
                        <Plus className="w-4 h-4 mr-2" /> Connect Account
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          ) : (
            connections.map((conn) => (
              <StaggerItem key={conn.id}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Link2 className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{conn.googleEmail}</h3>
                          <p className="text-sm text-gray-500">
                            {conn.mccAccountId
                              ? `MCC: ${conn.mccAccountId}`
                              : 'No MCC configured'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              {conn.isActive ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-green-600">Active</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-red-600">Inactive</span>
                                </>
                              )}
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500">
                              {conn.clients.length} client(s) linked
                            </span>
                            {conn.lastSyncAt && (
                              <>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-500">
                                  Last sync:{' '}
                                  {new Date(conn.lastSyncAt).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <SyncAllButton clientIds={conn.clients.map((c) => c.id)} />
                        <DisconnectButton
                          connectionId={conn.id}
                          hasClients={conn.clients.length > 0}
                        />
                      </div>
                    </div>

                    {/* Linked Clients */}
                    {conn.clients.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Linked Clients
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {conn.clients.map((client) => (
                            <Link
                              key={client.id}
                              href={`/admin/clients/${client.id}`}
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                            >
                              {client.companyName}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Sync Logs */}
                    {conn.syncLogs.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Recent Sync History
                        </h4>
                        <div className="space-y-2">
                          {conn.syncLogs.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS'
                                    ? 'bg-green-500'
                                    : log.status === 'FAILED'
                                      ? 'bg-red-500'
                                      : 'bg-yellow-500'
                                    }`}
                                />
                                <span className="text-gray-600">{log.type}</span>
                              </div>
                              <div className="flex items-center gap-4 text-gray-500">
                                <span>{log.recordsCount} records</span>
                                <span>
                                  {new Date(log.startedAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

function SyncAllButton({ clientIds }: { clientIds: string[] }) {
  if (clientIds.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled title="No clients linked">
        <RefreshCw className="w-4 h-4 mr-1" /> Sync All
      </Button>
    )
  }

  return (
    <form
      action={async () => {
        'use server'
        for (const clientId of clientIds) {
          const result = await syncClientData(clientId, 30)
          if (result.success) {
            await checkAndCreateAlerts(clientId)
          }
        }
        revalidatePath('/admin/accounts')
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        <RefreshCw className="w-4 h-4 mr-1" /> Sync All
      </Button>
    </form>
  )
}

function DisconnectButton({
  connectionId,
  hasClients,
}: {
  connectionId: string
  hasClients: boolean
}) {
  if (hasClients) {
    return (
      <Button variant="outline" size="sm" disabled title="Remove clients first">
        Disconnect
      </Button>
    )
  }

  return (
    <form
      action={async () => {
        'use server'
        await prisma.googleConnection.delete({ where: { id: connectionId } })
      }}
    >
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="text-red-600 hover:text-red-700"
      >
        Disconnect
      </Button>
    </form>
  )
}
