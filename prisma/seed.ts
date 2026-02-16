import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@glassbox.com',
      password: 'admin123', // In production, hash this!
      role: 'ADMIN',
    },
  })
  console.log('Created admin:', admin.email)

  // Create Client user with profile
  const client = await prisma.user.create({
    data: {
      email: 'client@example.com',
      password: 'client123',
      role: 'CLIENT',
      client: {
        create: {
          companyName: 'Kedai Kopi Ali',
          totalBudget: 3000,
          status: 'ACTIVE',
          notes: 'Minggu ni kita fokus target area Kuala Lumpur. Clicks naik 15% berbanding minggu lepas!',
        },
      },
    },
    include: { client: true },
  })
  console.log('Created client:', client.email)

  // Add sample metrics for last 14 days
  const clientProfile = client.client!
  const today = new Date()

  const metricsData = []
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    metricsData.push({
      clientId: clientProfile.id,
      date: date,
      spend: Math.floor(Math.random() * 150) + 50, // RM50-200
      impressions: Math.floor(Math.random() * 5000) + 2000, // 2000-7000
      clicks: Math.floor(Math.random() * 100) + 30, // 30-130
      conversions: Math.floor(Math.random() * 10) + 1, // 1-10
    })
  }

  await prisma.dailyMetrics.createMany({
    data: metricsData,
  })
  console.log('Created 14 days of metrics data')

  // Summary
  const totalSpend = metricsData.reduce((sum, m) => sum + m.spend, 0)
  console.log(`\nTotal spend: RM${totalSpend} / RM${clientProfile.totalBudget}`)
  console.log('Setup complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
