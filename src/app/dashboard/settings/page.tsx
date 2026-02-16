import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { ClientSettingsView } from './ClientSettingsView'

export default async function ClientSettingsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.clientId || !session.user.id) {
    return (
      <PortalLayout title="Settings" role="CLIENT">
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">No client profile found.</p>
        </div>
      </PortalLayout>
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      client: {
        select: {
          companyName: true,
          currency: true,
          monthlyBudget: true,
          notes: true,
          status: true,
          googleCustomerId: true,
          googleConnection: {
            select: {
              googleEmail: true,
              lastSyncAt: true,
            },
          },
        },
      },
    },
  })

  if (!user?.client) {
    return (
      <PortalLayout title="Settings" role="CLIENT">
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">No client profile found.</p>
        </div>
      </PortalLayout>
    )
  }

  return (
    <ClientSettingsView
      initialData={{
        profile: {
          name: user.name ?? '',
          email: user.email,
        },
        workspace: {
          companyName: user.client.companyName,
          currency: user.client.currency,
          monthlyBudget: user.client.monthlyBudget,
          notes: user.client.notes ?? '',
          status: user.client.status,
          googleCustomerId: user.client.googleCustomerId ?? '',
        },
        integration: {
          googleEmail: user.client.googleConnection?.googleEmail ?? '',
          lastSyncAt: user.client.googleConnection?.lastSyncAt?.toISOString() ?? null,
          connected: Boolean(user.client.googleConnection),
        },
      }}
    />
  )
}
