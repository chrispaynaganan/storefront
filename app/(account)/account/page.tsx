import { getUser } from '@/lib/auth'
import { ProfileForm } from '@/components/account/ProfileForm'

export const metadata = { title: 'My Account' }

export default async function AccountPage() {
  const user = await getUser()
  return (
    <div>
      <h1 className="text-2xl font-light text-[#3B1F0E] mb-2">Profile</h1>
      <p className="text-sm text-[#6B3A22] mb-8">Manage your personal information</p>
      <ProfileForm user={user} />
    </div>
  )
}