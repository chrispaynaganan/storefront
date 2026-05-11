import { getUser } from '@/lib/auth'
import { ProfileForm } from '@/components/account/ProfileForm'

export const metadata = { title: 'My Account' }

export default async function AccountPage() {
  const user = await getUser()
  return (
    <div>
      <h1 className="text-2xl font-light text-brown mb-2">Profile</h1>
      <p className="text-sm text-brown-light mb-8">Manage your personal information</p>
      <ProfileForm user={user} />
    </div>
  )
}