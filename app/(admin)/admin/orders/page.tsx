import { createServerSupabaseClient } from '@/lib/supabase-server'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater'
import Link from 'next/link'

export const metadata = { title: 'Orders — Admin' }

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabaseClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*, user:users(email, full_name), address:addresses(city, province)')
    .order('created_at', { ascending: false })

  const statusVariant: Record<string, any> = {
    pending: 'peach', paid: 'success', shipped: 'warning',
    delivered: 'success', cancelled: 'danger',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-light text-[#3B1F0E]">Orders</h1>
        <p className="text-sm text-[#6B3A22] mt-1">{orders?.length ?? 0} total</p>
      </div>

      <div className="bg-white rounded-xl border border-[#FFE8D6] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F4] border-b border-[#FFE8D6]">
            <tr>
              {['Order', 'Date', 'Customer', 'Location', 'Total', 'Status', 'Update', ''].map(h => (
                <th key={h} className="text-left text-xs text-[#6B3A22] font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FFE8D6]">
            {orders?.map(order => (
              <tr key={order.id} className="hover:bg-[#FAF7F4] transition-colors">
                <td className="px-4 py-3 font-medium text-[#3B1F0E]">
                  #{order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-4 py-3 text-[#6B3A22]">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3 text-[#6B3A22]">
                  {order.user?.full_name || order.user?.email || '—'}
                </td>
                <td className="px-4 py-3 text-[#6B3A22]">
                  {order.address ? `${order.address.city}, ${order.address.province}` : '—'}
                </td>
                <td className="px-4 py-3 text-[#3B1F0E]">{formatPrice(order.total, order.currency)}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`}
                    className="text-xs text-[#6B3A22] hover:text-[#3B1F0E] underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
          <div className="py-16 text-center text-sm text-[#6B3A22]">No orders yet.</div>
        )}
      </div>
    </div>
  )
}