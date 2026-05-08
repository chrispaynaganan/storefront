import { AddressCard } from '@/components/account/AddressCard'
import { Button } from '@/components/ui/Button'

export const metadata = { title: 'Saved Addresses' }

export default async function AccountAddressesPage() {
  // TODO: fetch addresses for current user
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light text-brown">Addresses</h1>
        <Button variant="outline">Add address</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* address cards */}
      </div>
    </div>
  )
}
