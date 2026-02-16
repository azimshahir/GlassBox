// GAQL queries for Google Ads API

export const QUERIES = {
  // Get all accessible customer accounts under MCC
  ACCESSIBLE_CUSTOMERS: `
    SELECT
      customer_client.id,
      customer_client.descriptive_name,
      customer_client.currency_code,
      customer_client.manager,
      customer_client.status
    FROM customer_client
    WHERE customer_client.status = 'ENABLED'
      AND customer_client.manager = false
  `,

  // Get all campaigns with basic info
  CAMPAIGNS: `
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
  `,

  // Get campaign metrics for date range
  CAMPAIGN_METRICS: (startDate: string, endDate: string) => `
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
  `,

  // Get account-level daily metrics
  DAILY_METRICS: (startDate: string, endDate: string) => `
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
  `,

  // Get account summary for last 30 days
  ACCOUNT_SUMMARY: `
    SELECT
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversions_value
    FROM customer
    WHERE segments.date DURING LAST_30_DAYS
  `,
}

// Helper to format date for GAQL (YYYY-MM-DD)
export function formatDateForGAQL(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Helper to convert micros to currency
export function microsToMoney(micros: number): number {
  return micros / 1_000_000
}

// Helper to get date range for sync
export function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return {
    startDate: formatDateForGAQL(startDate),
    endDate: formatDateForGAQL(endDate),
  }
}
