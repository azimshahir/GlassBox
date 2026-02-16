'use client'

import { cn } from '@/lib/utils'

interface Campaign {
  id: string
  name: string
  status: string
  channelType: string
  spend: number
  clicks: number
  conversions: number
  roas: number
}

interface CampaignTableProps {
  campaigns: Campaign[]
  currency?: string
}

export function CampaignTable({ campaigns, currency = 'RM' }: CampaignTableProps) {
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Top Campaigns</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spend
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clicks
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conv
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROAS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-gray-200 text-gray-600 text-xs font-medium flex items-center justify-center">
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
                  {campaign.spend.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-600">
                  {campaign.clicks.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-600">
                  {campaign.conversions}
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

      {campaigns.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500 text-sm">
          No campaigns found
        </div>
      )}
    </div>
  )
}
