import { GoogleAdsApi, Customer } from 'google-ads-api'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { refreshAccessToken } from './oauth'

let googleAdsClient: GoogleAdsApi | null = null

function getGoogleAdsClient(): GoogleAdsApi {
  if (!googleAdsClient) {
    googleAdsClient = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    })
  }
  return googleAdsClient
}

export async function getCustomerClient(
  connectionId: string,
  customerId: string
): Promise<Customer> {
  const connection = await prisma.googleConnection.findUnique({
    where: { id: connectionId },
  })

  if (!connection) {
    throw new Error('Google connection not found')
  }

  // Check if token needs refresh
  let accessToken = connection.accessToken
  if (!accessToken || !connection.tokenExpiry || connection.tokenExpiry < new Date()) {
    const refreshToken = decrypt(connection.refreshToken)
    const tokens = await refreshAccessToken(refreshToken)

    accessToken = tokens.access_token

    // Update tokens in database
    await prisma.googleConnection.update({
      where: { id: connectionId },
      data: {
        accessToken: tokens.access_token,
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    })
  }

  const client = getGoogleAdsClient()
  const refreshToken = decrypt(connection.refreshToken)

  return client.Customer({
    customer_id: customerId.replace(/-/g, ''),
    refresh_token: refreshToken,
    login_customer_id: connection.mccAccountId?.replace(/-/g, ''),
  })
}

export interface GoogleAdsAccount {
  id: string
  name: string
  currencyCode: string
  isManager: boolean
}

export async function listAccessibleAccounts(
  connectionId: string
): Promise<GoogleAdsAccount[]> {
  const connection = await prisma.googleConnection.findUnique({
    where: { id: connectionId },
  })

  if (!connection || !connection.mccAccountId) {
    throw new Error('Google connection or MCC account not found')
  }

  const customer = await getCustomerClient(connectionId, connection.mccAccountId)

  const results = await customer.query(`
    SELECT
      customer_client.id,
      customer_client.descriptive_name,
      customer_client.currency_code,
      customer_client.manager
    FROM customer_client
    WHERE customer_client.status = 'ENABLED'
  `)

  return results.map((row) => ({
    id: String(row.customer_client?.id || ''),
    name: row.customer_client?.descriptive_name || 'Unknown',
    currencyCode: row.customer_client?.currency_code || 'USD',
    isManager: row.customer_client?.manager || false,
  }))
}

export interface CampaignData {
  id: string
  name: string
  status: string
  channelType: string
  dailyBudget: number | null
  startDate: string | null
  endDate: string | null
}

export async function getCampaigns(
  connectionId: string,
  customerId: string
): Promise<CampaignData[]> {
  const customer = await getCustomerClient(connectionId, customerId)

  const results = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      campaign.start_date,
      campaign.end_date
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY campaign.name ASC
  `)

  return results.map((row) => {
    const campaign = row.campaign as Record<string, unknown> | undefined
    return {
      id: String(campaign?.id || ''),
      name: String(campaign?.name || 'Unknown'),
      status: String(campaign?.status || 'UNKNOWN'),
      channelType: String(campaign?.advertising_channel_type || 'UNKNOWN'),
      dailyBudget: row.campaign_budget?.amount_micros
        ? Number(row.campaign_budget.amount_micros) / 1_000_000
        : null,
      startDate: (campaign?.start_date as string) || null,
      endDate: (campaign?.end_date as string) || null,
    }
  })
}

export interface DailyMetricsData {
  date: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  roas: number
}

export async function getDailyMetrics(
  connectionId: string,
  customerId: string,
  startDate: string,
  endDate: string
): Promise<DailyMetricsData[]> {
  const customer = await getCustomerClient(connectionId, customerId)

  const results = await customer.query(`
    SELECT
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversions_value
    FROM customer
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY segments.date ASC
  `)

  return results.map((row) => {
    const cost = Number(row.metrics?.cost_micros || 0) / 1_000_000
    const conversionsValue = Number(row.metrics?.conversions_value || 0)

    return {
      date: row.segments?.date || '',
      impressions: Number(row.metrics?.impressions || 0),
      clicks: Number(row.metrics?.clicks || 0),
      cost,
      conversions: Number(row.metrics?.conversions || 0),
      ctr: Number(row.metrics?.ctr || 0) * 100,
      cpc: Number(row.metrics?.average_cpc || 0) / 1_000_000,
      roas: cost > 0 ? conversionsValue / cost : 0,
    }
  })
}

export interface CampaignMetricsData {
  campaignId: string
  campaignName: string
  date: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  impressionShare: number | null
}

export async function getCampaignMetrics(
  connectionId: string,
  customerId: string,
  startDate: string,
  endDate: string
): Promise<CampaignMetricsData[]> {
  const customer = await getCustomerClient(connectionId, customerId)

  const results = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.search_impression_share
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date ASC
  `)

  return results.map((row) => ({
    campaignId: String(row.campaign?.id || ''),
    campaignName: row.campaign?.name || 'Unknown',
    date: row.segments?.date || '',
    impressions: Number(row.metrics?.impressions || 0),
    clicks: Number(row.metrics?.clicks || 0),
    cost: Number(row.metrics?.cost_micros || 0) / 1_000_000,
    conversions: Number(row.metrics?.conversions || 0),
    ctr: Number(row.metrics?.ctr || 0) * 100,
    cpc: Number(row.metrics?.average_cpc || 0) / 1_000_000,
    impressionShare: row.metrics?.search_impression_share
      ? Number(row.metrics.search_impression_share) * 100
      : null,
  }))
}
