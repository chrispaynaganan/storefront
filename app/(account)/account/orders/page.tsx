import { OrderCard } from '@/components/account/OrderCard'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata = { title: 'My Orders' }

export default async function AccountOrdersPage() {
  // TODO: fetch orders for current user
  return (
    <div>
      <h1 className="text-2xl font-light text-brown mb-6">Order history</h1>
      <div className="space-y-4">
        <EmptyState message="No orders yet." />
      </div>
    </div>
  )
}
