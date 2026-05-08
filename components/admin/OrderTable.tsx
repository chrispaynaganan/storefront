import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import Link from 'next/link'
import type { Order } from '@/types'

export function OrderTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return <EmptyState message="No orders yet." />
  return (
    <div className="bg-white rounded-xl border border-peach-light overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-whitewash-off border-b border-peach-light">
          <tr>
            {['Order', 'Date', 'Customer', 'Total', 'Status', ''].map(h => (
              <th key={h} className="text-left text-xs text-brown-light font-medium px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-peach-light">
          {orders.map(o => (
            <tr key={o.id} className="hover:bg-whitewash">
              <td className="px-4 py-3 text-brown font-medium">#{o.id.slice(0, 8).toUpperCase()}</td>
              <td className="px-4 py-3 text-brown-light">{formatDate(o.created_at)}</td>
              <td className="px-4 py-3 text-brown-light">—</td>
              <td className="px-4 py-3 text-brown">{formatPrice(o.total, o.currency)}</td>
              <td className="px-4 py-3"><Badge variant="peach">{o.status}</Badge></td>
              <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="text-xs text-brown-light hover:text-brown underline">View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
