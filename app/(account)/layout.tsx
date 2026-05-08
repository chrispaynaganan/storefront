import { AccountSidebar } from '@/components/layout/AccountSidebar'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-10 gap-10">
        <AccountSidebar />
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
