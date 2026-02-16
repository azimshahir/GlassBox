import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'

const statusColors: Record<string, string> = {
  ENABLED: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  REMOVED: 'bg-red-100 text-red-700',
}

const channelIcons: Record<string, string> = {
  SEARCH: 'S',
  DISPLAY: 'D',
  VIDEO: 'V',
  SHOPPING: '$',
}

async function getCampaigns(filter?: string) {
  const campaigns = await prisma.campaign.findMany({
    where: filter && filter !== 'all'
      ? { status: filter.toUpperCase() }
      : undefined,
    include: {
      client: { select: { id: true, companyName: true, currency: true } },
      metrics: {
        orderBy: { date: 'desc' },
        take: 30,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return campaigns.map((c) => {
    const spend = c.metrics.reduce((s, m) => s + m.cost, 0)
    const clicks = c.metrics.reduce((s, m) => s + m.clicks, 0)
    const conversions = c.metrics.reduce((s, m) => s + m.conversions, 0)
    const impressions = c.metrics.reduce((s, m) => s + m.impressions, 0)
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      channelType: c.channelType,
      clientId: c.client.id,
      clientName: c.client.companyName,
      currency: c.client.currency,
      spend,
      clicks,
      conversions,
      impressions,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      roas: spend > 0 ? parseFloat((conversions / spend * 100).toFixed(1)) : 0,
    }
  })
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { filter } = await searchParams
  const campaigns = await getCampaigns(filter)

  const enabledCount = campaigns.filter((c) => !filter || filter === 'all'
    ? c.status === 'ENABLED'
    : false
  ).length

  return (
    <PortalLayout
      title="Campaigns"
      subtitle={`${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}`}
      role="ADMIN"
    >
      <StaggerContainer>
        {/* Filter Buttons */}
        <StaggerItem className="flex gap-2 mb-6">
          {[
            { key: undefined, label: 'All' },
            { key: 'enabled', label: 'Enabled' },
            { key: 'paused', label: 'Paused' },
          ].map((f) => (
            <Link key={f.key ?? 'all'} href={f.key ? `/admin/campaigns?filter=${f.key}` : '/admin/campaigns'}>
              <button
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  (filter ?? undefined) === f.key
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                )}
              >
                {f.label}
              </button>
            </Link>
          ))}
        </StaggerItem>

        {/* Campaigns Table */}
        <StaggerItem>
          <Card>
            {campaigns.length === 0 ? (
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No campaigns found</p>
              </CardContent>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                        Campaign
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                        Client
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                        Spend
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                        Clicks
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                        Conv
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                        CTR
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                        ROAS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-gray-200 text-gray-600 text-xs font-medium flex items-center justify-center flex-shrink-0">
                              {channelIcons[campaign.channelType] || '?'}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {campaign.name}
                              </p>
                              <span
                                className={cn(
                                  'inline-block text-xs px-2 py-0.5 rounded mt-1',
                                  statusColors[campaign.status] || 'bg-gray-100 text-gray-600'
                                )}
                              >
                                {campaign.status}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <Link
                            href={`/admin/clients/${campaign.clientId}`}
                            className="text-sm text-gray-600 hover:text-cyan-600"
                          >
                            {campaign.clientName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                          {campaign.currency}
                          {campaign.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600 hidden sm:table-cell">
                          {campaign.clicks.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600 hidden sm:table-cell">
                          {campaign.conversions}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600 hidden lg:table-cell">
                          {campaign.ctr.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              campaign.roas >= 3
                                ? 'text-green-600'
                                : campaign.roas >= 2
                                  ? 'text-cyan-600'
                                  : campaign.roas >= 1
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                            )}
                          >
                            {campaign.roas.toFixed(1)}x
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </PortalLayout>
  )
}
