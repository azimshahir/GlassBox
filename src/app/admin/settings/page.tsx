'use client'

import { useEffect, useState } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer'
import { CheckCircle, ExternalLink, Eye, EyeOff } from 'lucide-react'

const fields = [
  {
    key: 'GOOGLE_CLIENT_ID',
    label: 'Google Client ID',
    placeholder: 'xxxxx.apps.googleusercontent.com',
    helpUrl: 'https://console.cloud.google.com/apis/credentials',
    helpText: 'Google Cloud Console > APIs & Services > Credentials',
    secret: false,
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    label: 'Google Client Secret',
    placeholder: 'GOCSPX-xxxxx',
    helpUrl: 'https://console.cloud.google.com/apis/credentials',
    helpText: 'Same page as Client ID',
    secret: true,
  },
  {
    key: 'GOOGLE_ADS_DEVELOPER_TOKEN',
    label: 'Google Ads Developer Token',
    placeholder: 'xxxx-xxxx-xxxx',
    helpUrl: 'https://ads.google.com/aw/apicenter',
    helpText: 'Google Ads > Tools > API Center',
    secret: true,
  },
  {
    key: 'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
    label: 'MCC Account ID',
    placeholder: '123-456-7890',
    helpUrl: 'https://ads.google.com/aw/accountaccess',
    helpText: 'Your Manager Account (MCC) customer ID',
    secret: false,
  },
]

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setValues(data)
        setLoading(false)
      })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    setSaving(false)
    setSaved(true)

    // Refresh to get masked values back
    const res = await fetch('/api/settings')
    const data = await res.json()
    setValues(data)

    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <PortalLayout title="Settings" role="ADMIN">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout title="Settings" subtitle="Configure your integrations" role="ADMIN">
      <StaggerContainer className="max-w-2xl">
        {/* How It Works */}
        <StaggerItem>
          <Card className="mb-6 border-cyan-200 bg-cyan-50">
            <CardContent className="p-4">
              <h3 className="font-medium text-cyan-900 mb-2">How Google Ads Integration Works</h3>
              <ol className="text-sm text-cyan-800 space-y-1 list-decimal list-inside">
                <li>Paste your Google API credentials below and save</li>
                <li>Go to <strong>Google Accounts</strong> page and click "Connect"</li>
                <li>Login with your Google account that has Google Ads access</li>
                <li>GlassBox will auto-sync your campaign data</li>
              </ol>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Credentials Form */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle>Google API Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                {fields.map((field) => (
                  <div key={field.key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      <a
                        href={field.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                      >
                        {field.helpText}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                        value={values[field.key] || ''}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="pr-10"
                      />
                      {field.secret && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowSecrets((prev) => ({
                              ...prev,
                              [field.key]: !prev[field.key],
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets[field.key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    {values[field.key] && !values[field.key].includes('****') && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Value set
                      </p>
                    )}
                    {values[field.key]?.includes('****') && (
                      <p className="text-xs text-gray-500 mt-1">
                        Already configured. Paste a new value to update.
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    {saving ? 'Saving...' : 'Save Credentials'}
                  </Button>
                  {saved && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Saved successfully
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </PortalLayout>
  )
}
