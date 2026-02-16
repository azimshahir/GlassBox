import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Megaphone } from 'lucide-react'
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

async function getCampaigns(clientId: string) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { currency: true, companyName: true },
  })

  const campaigns = await prisma.campaign.findMany({
    where: { clientId },
    include: {
      metrics: {
        where: { date: { gte: startDate } },
        orderBy: { date: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  return {
    currency: client?.currency ?? 'RM',
    companyName: client?.companyName ?? '',
    campaigns: campaigns.map((c) => {
      const spend = c.metrics.reduce((s, m) => s + m.cost, 0)
      const clicks = c.metrics.reduce((s, m) => s + m.clicks, 0)
      const conversions = c.metrics.reduce((s, m) => s + m.conversions, 0)
      const impressions = c.metrics.reduce((s, m) => s + m.impressions, 0)
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        channelType: c.channelType,
        spend,
        clicks,
        conversions,
        impressions,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        roas: spend > 0 ? parseFloat((conversions / spend * 100).toFixed(1)) : 0,
      }
    }),
  }
}

export default async function ClientCampaignsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.clientId) {
    return (
      <PortalLayout title="Campaigns" role="CLIENT">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No client profile found.</p>
        </div>
      </PortalLayout>
    )
  }

  const { currency, companyName, campaigns } = await getCampaigns(session.user.clientId)

  return (
    <PortalLayout
      title="Campaigns"
      subtitle={`${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''} (Last 30 days)`}
      role="CLIENT"
      clientName={companyName}
    >
      <StaggerContainer>
        {campaigns.length === 0 ? (
          <StaggerItem>
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Yet</h3>
                <p className="text-gray-500">
                  Your campaigns will appear here once your admin sets them up.
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        ) : (
          <StaggerItem>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                        Campaign
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
                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                          {currency}
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
            </Card>
          </StaggerItem>
        )}
      </StaggerContainer>
    </PortalLayout>
  )
}
