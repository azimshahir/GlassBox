import { prisma } from '../prisma'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/adwords',
].join(' ')

// Resolve credentials: DB settings first, then .env fallback
export async function getGoogleCredentials() {
  const dbSettings = await prisma.settings.findMany({
    where: { key: { in: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] } },
  })
  const dbMap = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]))

  return {
    clientId: dbMap['GOOGLE_CLIENT_ID'] || process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: dbMap['GOOGLE_CLIENT_SECRET'] || process.env.GOOGLE_CLIENT_SECRET || '',
  }
}

export async function getGoogleAuthUrl(redirectUri: string, state?: string): Promise<string> {
  const { clientId } = await getGoogleCredentials()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
  id_token?: string
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  const { clientId, clientSecret } = await getGoogleCredentials()

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return response.json()
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  const { clientId, clientSecret } = await getGoogleCredentials()

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  return response.json()
}

export interface GoogleUserInfo {
  sub: string
  email: string
  email_verified: boolean
  name?: string
  picture?: string
}

export async function getGoogleUserInfo(
  accessToken: string
): Promise<GoogleUserInfo> {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get user info')
  }

  return response.json()
}
