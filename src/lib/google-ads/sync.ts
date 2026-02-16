import { prisma } from '@/lib/prisma'
import {
  getCampaigns,
  getDailyMetrics,
  getCampaignMetrics,
} from './client'
import { getDateRange } from './queries'

export interface SyncResult {
  success: boolean
  syncLogId: string
  recordsCount: number
  error?: string
}

export async function syncClientData(
  clientId: string,
  days: number = 30
): Promise<SyncResult> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { googleConnection: true },
  })

  if (!client || !client.googleConnection || !client.googleCustomerId) {
    return {
      success: false,
      syncLogId: '',
      recordsCount: 0,
      error: 'Client not configured for Google Ads sync',
    }
  }

  // Create sync log
  const syncLog = await prisma.syncLog.create({
    data: {
      connectionId: client.googleConnection.id,
      type: 'FULL',
      status: 'RUNNING',
    },
  })

  let recordsCount = 0

  try {
    const connectionId = client.googleConnection.id
    const customerId = client.googleCustomerId
    const { startDate, endDate } = getDateRange(days)

    // Sync campaigns
    const campaigns = await getCampaigns(connectionId, customerId)
    for (const camp of campaigns) {
      await prisma.campaign.upsert({
        where: {
          clientId_googleCampaignId: {
            clientId: client.id,
            googleCampaignId: camp.id,
          },
        },
        create: {
          clientId: client.id,
          googleCampaignId: camp.id,
          name: camp.name,
          status: camp.status,
          channelType: camp.channelType,
          dailyBudget: camp.dailyBudget,
          startDate: camp.startDate ? new Date(camp.startDate) : null,
          endDate: camp.endDate ? new Date(camp.endDate) : null,
        },
        update: {
          name: camp.name,
          status: camp.status,
          channelType: camp.channelType,
          dailyBudget: camp.dailyBudget,
          startDate: camp.startDate ? new Date(camp.startDate) : null,
          endDate: camp.endDate ? new Date(camp.endDate) : null,
        },
      })
      recordsCount++
    }

    // Sync daily metrics
    const dailyMetrics = await getDailyMetrics(
      connectionId,
      customerId,
      startDate,
      endDate
    )
    for (const metric of dailyMetrics) {
      const date = new Date(metric.date)
      date.setHours(0, 0, 0, 0)

      await prisma.dailyMetrics.upsert({
        where: {
          clientId_date: {
            clientId: client.id,
            date,
          },
        },
        create: {
          clientId: client.id,
          date,
          impressions: metric.impressions,
          clicks: metric.clicks,
          cost: metric.cost,
          conversions: metric.conversions,
          ctr: metric.ctr,
          cpc: metric.cpc,
          roas: metric.roas,
          source: 'API',
        },
        update: {
          impressions: metric.impressions,
          clicks: metric.clicks,
          cost: metric.cost,
          conversions: metric.conversions,
          ctr: metric.ctr,
          cpc: metric.cpc,
          roas: metric.roas,
          source: 'API',
        },
      })
      recordsCount++
    }

    // Sync campaign metrics
    const campaignMetrics = await getCampaignMetrics(
      connectionId,
      customerId,
      startDate,
      endDate
    )

    // Group by campaign
    const campaignMetricsMap = new Map<string, typeof campaignMetrics>()
    for (const metric of campaignMetrics) {
      const existing = campaignMetricsMap.get(metric.campaignId) || []
      existing.push(metric)
      campaignMetricsMap.set(metric.campaignId, existing)
    }

    for (const [campaignId, metrics] of campaignMetricsMap) {
      const campaign = await prisma.campaign.findFirst({
        where: {
          clientId: client.id,
          googleCampaignId: campaignId,
        },
      })

      if (!campaign) continue

      for (const metric of metrics) {
        const date = new Date(metric.date)
        date.setHours(0, 0, 0, 0)

        await prisma.campaignMetrics.upsert({
          where: {
            campaignId_date: {
              campaignId: campaign.id,
              date,
            },
          },
          create: {
            campaignId: campaign.id,
            date,
            impressions: metric.impressions,
            clicks: metric.clicks,
            cost: metric.cost,
            conversions: metric.conversions,
            ctr: metric.ctr,
            cpc: metric.cpc,
            impressionShare: metric.impressionShare,
          },
          update: {
            impressions: metric.impressions,
            clicks: metric.clicks,
            cost: metric.cost,
            conversions: metric.conversions,
            ctr: metric.ctr,
            cpc: metric.cpc,
            impressionShare: metric.impressionShare,
          },
        })
        recordsCount++
      }
    }

    // Update sync log and connection status
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'SUCCESS',
        recordsCount,
        completedAt: new Date(),
      },
    })

    await prisma.googleConnection.update({
      where: { id: client.googleConnection.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'SUCCESS',
      },
    })

    return {
      success: true,
      syncLogId: syncLog.id,
      recordsCount,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'FAILED',
        error: errorMessage,
        completedAt: new Date(),
      },
    })

    if (client.googleConnection) {
      await prisma.googleConnection.update({
        where: { id: client.googleConnection.id },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: 'FAILED',
        },
      })
    }

    return {
      success: false,
      syncLogId: syncLog.id,
      recordsCount,
      error: errorMessage,
    }
  }
}

export async function syncAllClients(): Promise<{
  total: number
  success: number
  failed: number
}> {
  const clients = await prisma.client.findMany({
    where: {
      googleCustomerId: { not: null },
      googleConnectionId: { not: null },
      googleConnection: { isActive: true },
    },
  })

  let success = 0
  let failed = 0

  for (const client of clients) {
    const result = await syncClientData(client.id)
    if (result.success) {
      success++
    } else {
      failed++
    }
  }

  return {
    total: clients.length,
    success,
    failed,
  }
}

export async function checkAndCreateAlerts(clientId: string): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client || client.monthlyBudget === 0) return

  // Get current month's spend
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const metrics = await prisma.dailyMetrics.aggregate({
    where: {
      clientId,
      date: { gte: startOfMonth },
    },
    _sum: { cost: true },
  })

  const totalSpend = metrics._sum.cost || 0
  const budgetPercentage = (totalSpend / client.monthlyBudget) * 100

  // Check thresholds
  const thresholds = [
    { percent: 100, type: 'BUDGET_100', severity: 'CRITICAL' },
    { percent: 90, type: 'BUDGET_90', severity: 'HIGH' },
    { percent: 80, type: 'BUDGET_80', severity: 'MEDIUM' },
  ]

  for (const threshold of thresholds) {
    if (budgetPercentage >= threshold.percent) {
      // Check if alert already exists for this threshold this month
      const existingAlert = await prisma.alert.findFirst({
        where: {
          clientId,
          type: threshold.type,
          createdAt: { gte: startOfMonth },
        },
      })

      if (!existingAlert) {
        await prisma.alert.create({
          data: {
            clientId,
            type: threshold.type,
            message: `Budget ${threshold.percent === 100 ? 'exceeded' : `at ${threshold.percent}%`}: ${client.currency}${totalSpend.toFixed(0)} / ${client.currency}${client.monthlyBudget.toFixed(0)}`,
            severity: threshold.severity,
          },
        })
      }

      break // Only create one alert per sync
    }
  }
}
