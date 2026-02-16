import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const userRole = cookieStore.get('userRole')?.value

  if (!userId) {
    redirect('/login')
  }

  if (userRole === 'ADMIN') {
    redirect('/admin')
  }

  redirect('/dashboard')
}
