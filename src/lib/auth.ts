import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? ''
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? ''
const hasGoogleOAuth = googleClientId.length > 0 && googleClientSecret.length > 0

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providers: any[] = [
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
        include: { client: true },
      })

      if (!user || !user.password) {
        return null
      }

      const isValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      )

      if (!isValid) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId,
      }
    },
  }),
]

if (hasGoogleOAuth) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  )
} else if (process.env.NODE_ENV !== 'production') {
  console.warn('[auth] Google OAuth env missing; credentials-only mode active.')
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      // Credentials login: user object already has our DB fields
      if (user && account?.provider === 'credentials') {
        token.id = user.id
        token.role = user.role
        token.clientId = user.clientId
      }

      // Google login: find or create DB user by email
      if (account?.provider === 'google' && token.email) {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          })

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: token.email,
                name: token.name ?? null,
                password: '',
                role: 'CLIENT',
              },
            })
          }

          token.id = dbUser.id
          token.role = dbUser.role
          token.clientId = dbUser.clientId
        } catch (e) {
          console.error('[auth] Google JWT callback error:', e)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.clientId = token.clientId as string | null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

// Type augmentation for next-auth
declare module 'next-auth' {
  interface User {
    role?: string
    clientId?: string | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      clientId: string | null
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string
    role?: string
    clientId?: string | null
    accessToken?: string
    refreshToken?: string
  }
}
