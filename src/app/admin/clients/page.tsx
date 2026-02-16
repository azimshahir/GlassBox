import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StatusIndicator } from '@/components/dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, MoreVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'

async function getClients(search?: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return prisma.client.findMany({
    where: search
      ? { companyName: { contains: search } }
      : undefined,
    include: {
      user: { select: { email: true, name: true } },
      dailyMetrics: {
        where: { date: { gte: startOfMonth } },
      },
      campaigns: true,
      googleConnection: { select: { googleEmail: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { q } = await searchParams
  const clients = await getClients(q)

  return (
    <PortalLayout title="Clients" subtitle="Manage your client accounts" role="ADMIN">
      <StaggerContainer>
        {/* Header Actions */}
        <StaggerItem className="flex flex-col sm:flex-row gap-4 mb-6">
          <form className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              name="q"
              placeholder="Search clients..."
              defaultValue={q ?? ''}
              className="pl-10"
            />
          </form>
          <Link href="/admin/clients/new">
            <Button className="bg-cyan-500 hover:bg-cyan-600">
              <Plus className="w-4 h-4 mr-2" /> Add Client
            </Button>
          </Link>
        </StaggerItem>

        {/* Clients Table */}
        <StaggerItem>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                      Google Account
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                      Monthly Spend
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                      Budget
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((client) => {
                    const monthSpend = client.dailyMetrics.reduce((s, m) => s + m.cost, 0)

                    return (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                              {client.companyName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{client.companyName}</p>
                              <p className="text-sm text-gray-500">
                                {client.user?.email || 'No user assigned'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusIndicator status={client.status} showLabel={false} size="sm" />
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {client.googleConnection ? (
                            <span className="text-sm text-gray-600 truncate max-w-[150px] block">
                              {client.googleConnection.googleEmail}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Not connected</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-medium text-gray-900">
                            {client.currency}
                            {monthSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                          <span className="text-gray-600">
                            {client.currency}
                            {client.monthlyBudget.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/clients/${client.id}`}>
                            <Button size="sm" variant="ghost">
                              Edit
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {clients.length === 0 && (
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No clients yet</p>
                <Link href="/admin/clients/new">
                  <Button className="bg-cyan-500 hover:bg-cyan-600">
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Client
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </PortalLayout>
  )
}
