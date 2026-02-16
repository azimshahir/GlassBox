import * as bcrypt from 'bcryptjs'
import { createScriptPrismaClient } from './client'

const args = new Set(process.argv.slice(2))
const { prisma, target, databaseLabel } = createScriptPrismaClient()

const allowRemote = args.has('--allow-remote')
const expectRemote = args.has('--expect-remote')
const resetData =
  args.has('--reset') || (!args.has('--no-reset') && target === 'sqlite')

async function main() {
  console.log(`Seeding target: ${target} (${databaseLabel})`)

  if (expectRemote && target !== 'turso') {
    throw new Error(
      'Expected Turso target but script is using sqlite. Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.'
    )
  }

  if (target === 'turso' && !allowRemote) {
    throw new Error(
      'Refusing to seed Turso without --allow-remote. Run: npm run db:seed:turso'
    )
  }

  // Clear existing data
  if (resetData) {
    await prisma.alert.deleteMany()
    await prisma.campaignMetrics.deleteMany()
    await prisma.campaign.deleteMany()
    await prisma.dailyMetrics.deleteMany()
    await prisma.syncLog.deleteMany()
    await prisma.user.deleteMany()
    await prisma.client.deleteMany()
    await prisma.googleConnection.deleteMany()
    await prisma.settings.deleteMany()

    console.log('Cleared existing data')
  } else {
    console.log('Skipping destructive reset (use --reset to force).')

    const existingUsers = await prisma.user.count()
    const existingClients = await prisma.client.count()
    if (existingUsers > 0 || existingClients > 0) {
      throw new Error(
        'Database already has data. Re-run with --reset (destructive) or use npm run db:bootstrap-admin for login setup only.'
      )
    }
  }

  // Create Client 1
  const client1 = await prisma.client.create({
    data: {
      companyName: 'Kedai Kopi Ali',
      monthlyBudget: 5000,
      currency: 'MYR',
      status: 'ACTIVE',
      notes: 'Minggu ni performance steady. CTR turun sikit sebab kita expand ke audience baru. Budget on track, conversions naik 15%.',
    },
  })

  // Create Client 2
  const client2 = await prisma.client.create({
    data: {
      companyName: 'Tech Solutions Sdn Bhd',
      monthlyBudget: 10000,
      currency: 'MYR',
      status: 'LEARNING',
      notes: 'Baru start campaign minggu ni. Masih dalam learning phase, expected 2 minggu lagi untuk optimize.',
    },
  })

  // Create Client 3
  const client3 = await prisma.client.create({
    data: {
      companyName: 'Fashion House MY',
      monthlyBudget: 8000,
      currency: 'MYR',
      status: 'ACTIVE',
      notes: 'Campaign CNY promo dah start. Performance sangat bagus, ROAS 4.2x!',
    },
  })

  console.log('Created clients')

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@glassbox.com',
      password: adminPassword,
      name: 'Admin GlassBox',
      role: 'ADMIN',
    },
  })
  console.log('Created admin:', admin.email)

  // Create Client users
  const client1Password = await bcrypt.hash('client123', 10)
  await prisma.user.create({
    data: {
      email: 'ali@kedaikopi.com',
      password: client1Password,
      name: 'Ali Ahmad',
      role: 'CLIENT',
      clientId: client1.id,
    },
  })

  await prisma.user.create({
    data: {
      email: 'tech@solutions.com',
      password: client1Password,
      name: 'Sarah Lee',
      role: 'CLIENT',
      clientId: client2.id,
    },
  })

  await prisma.user.create({
    data: {
      email: 'fashion@house.my',
      password: client1Password,
      name: 'Maya Tan',
      role: 'CLIENT',
      clientId: client3.id,
    },
  })

  console.log('Created client users')

  // Add campaigns for Client 1
  const campaign1 = await prisma.campaign.create({
    data: {
      clientId: client1.id,
      googleCampaignId: 'camp_001',
      name: 'Brand Search - Kedai Kopi',
      status: 'ENABLED',
      channelType: 'SEARCH',
      dailyBudget: 100,
    },
  })

  const campaign2 = await prisma.campaign.create({
    data: {
      clientId: client1.id,
      googleCampaignId: 'camp_002',
      name: 'Display - Coffee Lovers',
      status: 'ENABLED',
      channelType: 'DISPLAY',
      dailyBudget: 80,
    },
  })

  const campaign3 = await prisma.campaign.create({
    data: {
      clientId: client1.id,
      googleCampaignId: 'camp_003',
      name: 'Remarketing - Website Visitors',
      status: 'ENABLED',
      channelType: 'DISPLAY',
      dailyBudget: 50,
    },
  })

  console.log('Created campaigns')

  // Generate 30 days of metrics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Daily metrics for all clients
  for (const client of [client1, client2, client3]) {
    const metricsData = []
    const baseSpend = client.id === client1.id ? 150 : client.id === client2.id ? 300 : 250
    const baseClicks = client.id === client1.id ? 80 : client.id === client2.id ? 120 : 100

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const impressions = Math.floor(Math.random() * 5000) + 3000
      const clicks = Math.floor(Math.random() * 50) + baseClicks
      const cost = Math.floor(Math.random() * 80) + baseSpend
      const conversions = Math.floor(Math.random() * 8) + 2
      const ctr = (clicks / impressions) * 100
      const cpc = cost / clicks

      metricsData.push({
        clientId: client.id,
        date: date,
        impressions,
        clicks,
        cost,
        conversions,
        ctr: parseFloat(ctr.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        roas: parseFloat((conversions * 50 / cost).toFixed(2)),
        source: 'MANUAL',
      })
    }

    await prisma.dailyMetrics.createMany({ data: metricsData })
  }

  console.log('Created 30 days of daily metrics for all clients')

  // Campaign metrics for Client 1 campaigns
  for (const campaign of [campaign1, campaign2, campaign3]) {
    const campaignMetrics = []
    const baseCost = campaign.id === campaign1.id ? 80 : campaign.id === campaign2.id ? 50 : 30

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const impressions = Math.floor(Math.random() * 2000) + 1000
      const clicks = Math.floor(Math.random() * 30) + 20
      const cost = Math.floor(Math.random() * 30) + baseCost
      const conversions = Math.floor(Math.random() * 4) + 1
      const ctr = (clicks / impressions) * 100
      const cpc = cost / clicks

      campaignMetrics.push({
        campaignId: campaign.id,
        date: date,
        impressions,
        clicks,
        cost,
        conversions,
        ctr: parseFloat(ctr.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        impressionShare: parseFloat((Math.random() * 30 + 50).toFixed(2)),
      })
    }

    await prisma.campaignMetrics.createMany({ data: campaignMetrics })
  }

  console.log('Created campaign metrics')

  // Create some alerts
  await prisma.alert.createMany({
    data: [
      {
        clientId: client1.id,
        type: 'BUDGET_80',
        message: 'Budget mencapai 80% (RM4,000 / RM5,000)',
        severity: 'MEDIUM',
        isRead: false,
      },
      {
        clientId: client3.id,
        type: 'CTR_DROP',
        message: 'CTR turun 15% berbanding minggu lepas',
        severity: 'LOW',
        isRead: true,
      },
    ],
  })

  console.log('Created sample alerts')

  // Summary
  const totalClients = await prisma.client.count()
  const totalMetrics = await prisma.dailyMetrics.count()
  const totalCampaigns = await prisma.campaign.count()

  console.log('\n=== Seed Complete ===')
  console.log(`Clients: ${totalClients}`)
  console.log(`Campaigns: ${totalCampaigns}`)
  console.log(`Daily Metrics Records: ${totalMetrics}`)
  console.log('\nLogin credentials:')
  console.log('Admin: admin@glassbox.com / admin123')
  console.log('Client 1: ali@kedaikopi.com / client123')
  console.log('Client 2: tech@solutions.com / client123')
  console.log('Client 3: fashion@house.my / client123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
