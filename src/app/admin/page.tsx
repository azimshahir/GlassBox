import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PulseIndicator } from '@/components/PulseIndicator'
import { AdminHeader } from './AdminHeader'

async function getClients() {
  return prisma.clientProfile.findMany({
    include: {
      user: { select: { email: true } },
      metrics: { orderBy: { date: 'desc' }, take: 30 },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const userRole = cookieStore.get('userRole')?.value

  if (userRole !== 'ADMIN') redirect('/login')

  const clients = await getClients()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid gap-4">
          {clients.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No clients yet. Add your first client!
              </CardContent>
            </Card>
          ) : (
            clients.map((client) => {
              const totalSpend = client.metrics.reduce((sum, m) => sum + m.spend, 0)
              const percentage = (totalSpend / client.totalBudget) * 100

              return (
                <Link key={client.id} href={`/admin/clients/${client.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                            {client.companyName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{client.companyName}</h3>
                            <p className="text-sm text-gray-500">{client.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden md:block">
                            <p className="text-sm text-gray-500">Budget Used</p>
                            <p className="font-medium">
                              RM{totalSpend.toLocaleString()} / RM{client.totalBudget.toLocaleString()}
                            </p>
                          </div>
                          <div className="w-24 hidden sm:block">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-500 rounded-full"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 text-right mt-1">{percentage.toFixed(0)}%</p>
                          </div>
                          <PulseIndicator status={client.status as 'ACTIVE' | 'LEARNING' | 'PAUSED'} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
