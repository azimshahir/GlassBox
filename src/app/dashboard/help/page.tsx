import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BadgeCheck,
  BellRing,
  BookOpen,
  CircleHelp,
  LifeBuoy,
  Mail,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const faqItems = [
  {
    question: 'Kenapa dashboard kosong walaupun campaign dah live?',
    answer:
      'Biasanya sebab data sync belum berjalan atau Google Customer ID belum di-set. Semak di Settings dan minta admin trigger sync.',
  },
  {
    question: 'Macam mana nak tukar alert supaya tak terlalu banyak?',
    answer:
      'Buka Settings > Local Preferences, kemudian matikan email alerts atau ubah weekly digest ikut keperluan team anda.',
  },
  {
    question: 'Boleh tak saya edit campaign terus dari portal ini?',
    answer:
      'Buat masa ini portal fokus kepada monitoring. Perubahan campaign masih dibuat di Google Ads oleh admin/account manager.',
  },
  {
    question: 'Saya perlukan laporan custom, siapa saya patut hubungi?',
    answer:
      'Gunakan butang Contact Support di bawah. Sertakan objective, period, dan KPI supaya pasukan support boleh siapkan laporan lebih cepat.',
  },
]

async function getHelpContext(clientId: string) {
  const [client, unreadAlerts, campaignCount] = await prisma.$transaction([
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        companyName: true,
        status: true,
        googleCustomerId: true,
        googleConnection: {
          select: {
            googleEmail: true,
            lastSyncAt: true,
          },
        },
      },
    }),
    prisma.alert.count({
      where: {
        clientId,
        isRead: false,
      },
    }),
    prisma.campaign.count({
      where: { clientId },
    }),
  ])

  return { client, unreadAlerts, campaignCount }
}

export default async function ClientHelpPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.clientId) {
    return (
      <PortalLayout title="Help Center" role="CLIENT">
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">No client profile found.</p>
        </div>
      </PortalLayout>
    )
  }

  const { client, unreadAlerts, campaignCount } = await getHelpContext(session.user.clientId)

  if (!client) {
    return (
      <PortalLayout title="Help Center" role="CLIENT">
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">No client profile found.</p>
        </div>
      </PortalLayout>
    )
  }

  const isConnected = Boolean(client.googleConnection?.googleEmail)
  const lastSyncLabel = client.googleConnection?.lastSyncAt
    ? new Date(client.googleConnection.lastSyncAt).toLocaleString()
    : 'No sync recorded yet'

  return (
    <PortalLayout
      title="Help Center"
      subtitle="Guides, troubleshooting, and direct support for your workspace"
      role="CLIENT"
      clientName={client.companyName}
    >
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-sky-100/70 to-emerald-100/70 p-6">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/40 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Client Support
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                Need help with {client.companyName}?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Quick answers and support actions to keep your campaigns running smoothly.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/dashboard/settings">
                  <BookOpen className="mr-1 h-4 w-4" /> Open Settings
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:support@glassbox.com?subject=GlassBox%20Support%20Request">
                  <Mail className="mr-1 h-4 w-4" /> Contact Support
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                Account Health
              </CardTitle>
              <CardDescription>Ringkasan status akaun dan akses integration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="rounded-lg bg-muted/60 px-3 py-2">
                Client status: <strong>{client.status}</strong>
              </p>
              <p className="rounded-lg bg-muted/60 px-3 py-2">
                Google link: <strong>{isConnected ? 'Connected' : 'Not connected'}</strong>
              </p>
              <p className="rounded-lg bg-muted/60 px-3 py-2">
                Last sync: <strong>{lastSyncLabel}</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BellRing className="h-4 w-4 text-amber-600" />
                Alerts & Campaigns
              </CardTitle>
              <CardDescription>Apa yang perlu anda semak dulu sebelum minta bantuan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="rounded-lg bg-muted/60 px-3 py-2">
                Active campaigns tracked: <strong>{campaignCount}</strong>
              </p>
              <p className="rounded-lg bg-muted/60 px-3 py-2">
                Unread alerts: <strong>{unreadAlerts}</strong>
              </p>
              <p className="rounded-lg bg-muted/60 px-3 py-2">
                Google customer ID:{' '}
                <strong>{client.googleCustomerId ? client.googleCustomerId : 'Not assigned yet'}</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LifeBuoy className="h-4 w-4 text-sky-600" />
                Fast Actions
              </CardTitle>
              <CardDescription>Tindakan paling cepat untuk selesaikan isu biasa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <a
                className="block rounded-lg border border-border bg-card px-3 py-2 hover:bg-muted/40"
                href="mailto:support@glassbox.com?subject=Urgent%20Sync%20Issue"
              >
                Email support for sync issue
              </a>
              <Link
                className="block rounded-lg border border-border bg-card px-3 py-2 hover:bg-muted/40"
                href="/dashboard/campaigns"
              >
                Review campaign performance
              </Link>
              <Link
                className="block rounded-lg border border-border bg-card px-3 py-2 hover:bg-muted/40"
                href="/dashboard/settings"
              >
                Update profile and preferences
              </Link>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleHelp className="h-4 w-4 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Jawapan cepat untuk soalan yang paling kerap ditanya client.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {faqItems.map((item, index) => (
              <details
                key={item.question}
                className={cn(
                  'rounded-xl border border-border bg-card px-4 py-3',
                  index === 0 ? 'open:border-primary/30 open:bg-primary/5' : ''
                )}
                open={index === 0}
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </CardContent>
        </Card>

        <Card className="border-amber-300/50 bg-amber-50/60">
          <CardContent className="flex items-start gap-3 py-5 text-sm text-amber-900">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              Untuk isu akses akaun atau perubahan role (contoh: nak jadikan user sebagai admin), minta admin anda
              update dari panel admin atau hubungi support dengan email organisasi rasmi.
            </p>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
