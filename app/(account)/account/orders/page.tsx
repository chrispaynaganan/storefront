import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { OrderCard } from '@/components/account/OrderCard'
import { EmptyState } from '@/components/ui/EmptyState'
import Link from 'next/link'

export const metadata = { title: 'My Orders' }

export default async function AccountOrdersPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(*, variant:variants(*, product:products(*)))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-light text-brown mb-6">Order history</h1>
      {!orders?.length ? (
        <div className="text-center py-16">
          <EmptyState message="You haven't placed any orders yet." />
          <Link
            href="/products"
            className="inline-block mt-6 bg-brown text-whitewash text-sm font-medium rounded-full px-8 py-3 hover:bg-brown-light transition-colors"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}