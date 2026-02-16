'use client'

import { useEffect, useMemo, useState } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, CircleAlert, Cloud, Clock3, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'

type SettingsResponse = {
  profile: {
    name: string
    email: string
  }
  workspace: {
    companyName: string
    currency: string
    monthlyBudget: number
    notes: string
    status: string
    googleCustomerId: string
  }
  integration: {
    googleEmail: string
    lastSyncAt: string | null
    connected: boolean
  }
}

type LocalPreferences = {
  emailAlerts: boolean
  weeklyDigest: boolean
  budgetWarnings: boolean
  compactNumbers: boolean
  reportDay: 'monday' | 'friday'
}

type FormState = {
  name: string
  companyName: string
  currency: string
  monthlyBudget: string
  notes: string
}

const preferenceStorageKey = 'glassbox.client.settings.preferences'

const defaultPreferences: LocalPreferences = {
  emailAlerts: true,
  weeklyDigest: true,
  budgetWarnings: true,
  compactNumbers: false,
  reportDay: 'monday',
}

function buildFormState(data: SettingsResponse): FormState {
  return {
    name: data.profile.name ?? '',
    companyName: data.workspace.companyName ?? '',
    currency: data.workspace.currency ?? 'MYR',
    monthlyBudget: String(data.workspace.monthlyBudget ?? 0),
    notes: data.workspace.notes ?? '',
  }
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
        connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      )}
    >
      {connected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
      {connected ? 'Google Connected' : 'Connection Pending'}
    </span>
  )
}

function PreferenceToggle({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-full rounded-xl border p-3 text-left transition-colors',
        checked ? 'border-primary/40 bg-primary/5' : 'border-border bg-card hover:bg-muted/40'
      )}
      aria-pressed={checked}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div
          className={cn(
            'relative h-6 w-10 rounded-full transition-colors',
            checked ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
              checked ? 'translate-x-[18px]' : 'translate-x-0.5'
            )}
          />
        </div>
      </div>
    </button>
  )
}

export function ClientSettingsView({ initialData }: { initialData: SettingsResponse }) {
  const [data, setData] = useState(initialData)
  const [form, setForm] = useState<FormState>(() => buildFormState(initialData))
  const [baseline, setBaseline] = useState<FormState>(() => buildFormState(initialData))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<LocalPreferences>(defaultPreferences)

  useEffect(() => {
    const raw = window.localStorage.getItem(preferenceStorageKey)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as Partial<LocalPreferences>
      setPreferences((current) => ({
        ...current,
        ...parsed,
        reportDay: parsed.reportDay === 'friday' ? 'friday' : 'monday',
      }))
    } catch {
      window.localStorage.removeItem(preferenceStorageKey)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences))
  }, [preferences])

  const hasChanges = useMemo(() => JSON.stringify(form) !== JSON.stringify(baseline), [form, baseline])

  const lastSyncedLabel = useMemo(() => {
    if (!data.integration.lastSyncAt) return 'No sync history yet'
    return new Date(data.integration.lastSyncAt).toLocaleString()
  }, [data.integration.lastSyncAt])

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const monthlyBudgetValue = Number(form.monthlyBudget)
    if (!Number.isFinite(monthlyBudgetValue) || monthlyBudgetValue < 0) {
      setError('Monthly budget must be a valid non-negative number.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          companyName: form.companyName,
          currency: form.currency,
          monthlyBudget: monthlyBudgetValue,
          notes: form.notes,
        }),
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string }
        setError(result.error ?? 'Failed to save settings.')
        return
      }

      const updated = (await response.json()) as SettingsResponse
      setData(updated)
      const nextForm = buildFormState(updated)
      setForm(nextForm)
      setBaseline(nextForm)
      setSavedAt(new Date().toLocaleTimeString())
    } catch {
      setError('Network error while saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setForm(baseline)
    setError('')
  }

  return (
    <PortalLayout
      title="Settings"
      subtitle="Tune your workspace, alerts, and reporting defaults"
      role="CLIENT"
      clientName={data.workspace.companyName}
    >
      <StaggerContainer className="mx-auto w-full max-w-6xl space-y-6">
        <StaggerItem>
          <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/10 to-emerald-100/60 p-6">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
            <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Your Workspace Control Center
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {data.workspace.companyName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep account details accurate and align alerts with your daily workflow.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill connected={data.integration.connected} />
                <span className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Status: {data.workspace.status}
                </span>
              </div>
            </div>
          </section>
        </StaggerItem>

        <StaggerItem className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Account & Workspace</CardTitle>
              <CardDescription>These values are used in reports and dashboard summaries.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Contact Name</label>
                    <Input
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                    <Input value={data.profile.email} readOnly className="cursor-not-allowed bg-muted/60" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Company Name</label>
                    <Input
                      value={form.companyName}
                      onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="MYR">MYR</option>
                      <option value="USD">USD</option>
                      <option value="SGD">SGD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Monthly Budget</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monthlyBudget}
                    onChange={(event) => setForm((current) => ({ ...current, monthlyBudget: event.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Reporting Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Add context for your weekly summary..."
                    rows={5}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </div>

                {error && (
                  <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={saving || !hasChanges}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={saving || !hasChanges}>
                    Reset
                  </Button>
                  {savedAt && (
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Saved at {savedAt}
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Local Preferences</CardTitle>
              <CardDescription>
                Personal toggles stored in this browser only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PreferenceToggle
                label="Email Alerts"
                description="Receive immediate alert notifications."
                checked={preferences.emailAlerts}
                onToggle={() =>
                  setPreferences((current) => ({ ...current, emailAlerts: !current.emailAlerts }))
                }
              />
              <PreferenceToggle
                label="Weekly Digest"
                description="Get one concise performance recap every week."
                checked={preferences.weeklyDigest}
                onToggle={() =>
                  setPreferences((current) => ({ ...current, weeklyDigest: !current.weeklyDigest }))
                }
              />
              <PreferenceToggle
                label="Budget Warnings"
                description="Highlight pacing risk earlier on dashboard cards."
                checked={preferences.budgetWarnings}
                onToggle={() =>
                  setPreferences((current) => ({ ...current, budgetWarnings: !current.budgetWarnings }))
                }
              />
              <PreferenceToggle
                label="Compact Numbers"
                description="Use 1.2K and 3.4M formatting in charts."
                checked={preferences.compactNumbers}
                onToggle={() =>
                  setPreferences((current) => ({ ...current, compactNumbers: !current.compactNumbers }))
                }
              />
              <div className="rounded-xl border border-border p-3">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Digest Delivery Day
                </label>
                <select
                  value={preferences.reportDay}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      reportDay: event.target.value === 'friday' ? 'friday' : 'monday',
                    }))
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="monday">Monday</option>
                  <option value="friday">Friday</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-primary" />
                Google Ads Integration
              </CardTitle>
              <CardDescription>Connection details synced from your admin setup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Google Account</p>
                <p className="mt-1 font-medium text-foreground">
                  {data.integration.googleEmail || 'Not connected yet'}
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Google Customer ID</p>
                <p className="mt-1 font-medium text-foreground">
                  {data.workspace.googleCustomerId || 'Not assigned'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                Last sync: {lastSyncedLabel}
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                Communication
              </CardTitle>
              <CardDescription>How this workspace currently routes updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="rounded-lg bg-muted/60 p-3">
                Billing and account security updates are sent to your login email.
              </p>
              <p className="rounded-lg bg-muted/60 p-3">
                For password resets or access changes, contact your account admin.
              </p>
              <p className="rounded-lg bg-muted/60 p-3">
                Tip: keep your company name and notes updated so weekly reports stay clean and clear.
              </p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </PortalLayout>
  )
}
