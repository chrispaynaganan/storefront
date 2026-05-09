import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AddressCard } from '@/components/account/AddressCard'
import { AddressFormModal } from '@/components/account/AddressFormModal'

export const metadata = { title: 'Saved Addresses' }

export default async function AccountAddressesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-brown">Addresses</h1>
          <p className="text-sm text-brown-light mt-1">{addresses?.length ?? 0} saved</p>
        </div>
        <AddressFormModal />
      </div>
      {(!addresses || addresses.length === 0) ? (
        <div className="text-center py-16">
          <p className="text-sm text-brown-light mb-4">No addresses saved yet.</p>
          <AddressFormModal label="Add your first address" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(address => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}
    </div>
  )
}