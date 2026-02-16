import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import LandingPage from '@/components/LandingPage'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    if (session.user.role === 'ADMIN') {
      redirect('/admin')
    }
    redirect('/dashboard')
  }

  return <LandingPage />
}
