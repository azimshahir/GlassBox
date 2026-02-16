import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getGoogleAuthUrl, getGoogleCredentials } from '@/lib/google-ads/oauth'

export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clientId } = await getGoogleCredentials()
  if (!clientId) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin/settings?error=missing_credentials`
    )
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/google/callback`
  const authUrl = await getGoogleAuthUrl(redirectUri)

  return NextResponse.redirect(authUrl)
}
