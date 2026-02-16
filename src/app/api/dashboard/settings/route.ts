import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type SettingsPayload = {
  name: string
  companyName: string
  currency: string
  monthlyBudget: number
  notes: string
}

function sanitizeString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return undefined
  return value.trim().slice(0, maxLength)
}

export async function GET() {
  const session = await auth()

  if (!session?.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!session.user.clientId) {
    return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })
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
    return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })
  }

  return NextResponse.json({
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
  })
}

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!session.user.clientId) {
    return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })
  }

  let body: Partial<SettingsPayload>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const name = sanitizeString(body.name, 120)
  const companyName = sanitizeString(body.companyName, 140)
  const currencyInput = sanitizeString(body.currency, 8)
  const notes = sanitizeString(body.notes, 2500)

  const monthlyBudgetRaw =
    typeof body.monthlyBudget === 'number'
      ? body.monthlyBudget
      : typeof body.monthlyBudget === 'string'
        ? Number(body.monthlyBudget)
        : undefined

  if (monthlyBudgetRaw !== undefined && (!Number.isFinite(monthlyBudgetRaw) || monthlyBudgetRaw < 0)) {
    return NextResponse.json({ error: 'Monthly budget must be a valid non-negative number' }, { status: 400 })
  }

  const userData: { name?: string | null } = {}
  const clientData: {
    companyName?: string
    currency?: string
    monthlyBudget?: number
    notes?: string | null
  } = {}

  if (name !== undefined) {
    userData.name = name || null
  }

  if (companyName !== undefined) {
    if (!companyName) {
      return NextResponse.json({ error: 'Company name cannot be empty' }, { status: 400 })
    }
    clientData.companyName = companyName
  }

  if (currencyInput !== undefined) {
    const currency = currencyInput.toUpperCase()
    if (!/^[A-Z]{3,5}$/.test(currency)) {
      return NextResponse.json({ error: 'Currency must be 3-5 letters' }, { status: 400 })
    }
    clientData.currency = currency
  }

  if (monthlyBudgetRaw !== undefined) {
    clientData.monthlyBudget = monthlyBudgetRaw
  }

  if (notes !== undefined) {
    clientData.notes = notes || null
  }

  if (Object.keys(userData).length === 0 && Object.keys(clientData).length === 0) {
    return NextResponse.json({ success: true })
  }

  const [updatedUser, updatedClient] = await prisma.$transaction([
    Object.keys(userData).length > 0
      ? prisma.user.update({
          where: { id: session.user.id },
          data: userData,
          select: { name: true, email: true },
        })
      : prisma.user.findUniqueOrThrow({
          where: { id: session.user.id },
          select: { name: true, email: true },
        }),
    Object.keys(clientData).length > 0
      ? prisma.client.update({
          where: { id: session.user.clientId },
          data: clientData,
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
        })
      : prisma.client.findUniqueOrThrow({
          where: { id: session.user.clientId },
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
        }),
  ])

  return NextResponse.json({
    profile: {
      name: updatedUser.name ?? '',
      email: updatedUser.email,
    },
    workspace: {
      companyName: updatedClient.companyName,
      currency: updatedClient.currency,
      monthlyBudget: updatedClient.monthlyBudget,
      notes: updatedClient.notes ?? '',
      status: updatedClient.status,
      googleCustomerId: updatedClient.googleCustomerId ?? '',
    },
    integration: {
      googleEmail: updatedClient.googleConnection?.googleEmail ?? '',
      lastSyncAt: updatedClient.googleConnection?.lastSyncAt?.toISOString() ?? null,
      connected: Boolean(updatedClient.googleConnection),
    },
  })
}
