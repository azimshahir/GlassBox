import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'
import {
  exchangeCodeForTokens,
  getGoogleUserInfo,
} from '@/lib/google-ads/oauth'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/accounts?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/admin/accounts?error=no_code', request.url)
    )
  }

  try {
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/google/callback`
    const tokens = await exchangeCodeForTokens(code, redirectUri)

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL('/admin/accounts?error=no_refresh_token', request.url)
      )
    }

    // Get user info
    const userInfo = await getGoogleUserInfo(tokens.access_token)

    // Check if connection already exists
    const existing = await prisma.googleConnection.findFirst({
      where: { googleEmail: userInfo.email },
    })

    if (existing) {
      // Update existing connection
      await prisma.googleConnection.update({
        where: { id: existing.id },
        data: {
          refreshToken: encrypt(tokens.refresh_token),
          accessToken: tokens.access_token,
          tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
          isActive: true,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new connection
      await prisma.googleConnection.create({
        data: {
          googleEmail: userInfo.email,
          refreshToken: encrypt(tokens.refresh_token),
          accessToken: tokens.access_token,
          tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
          isActive: true,
        },
      })
    }

    return NextResponse.redirect(
      new URL('/admin/accounts?success=connected', request.url)
    )
  } catch (err) {
    console.error('Google OAuth error:', err)
    return NextResponse.redirect(
      new URL('/admin/accounts?error=oauth_failed', request.url)
    )
  }
}
