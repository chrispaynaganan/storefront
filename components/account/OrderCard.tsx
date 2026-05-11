import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'

const statusVariant: Record<string, 'peach' | 'success' | 'warning' | 'danger' | 'brown'> = {
  pending: 'peach',
  paid: 'success',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'danger',
}

export function OrderCard({ order }: { order: any }) {
  const items = order.items ?? []

  return (
    <Link href={`/account/orders/${order.id}`}
      className="block bg-white rounded-xl border border-peach-light p-5 hover:border-peach transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-brown">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-brown-light mt-0.5">{formatDate(order.created_at)}</p>
        </div>
        <Badge variant={statusVariant[order.status] ?? 'peach'}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {items.slice(0, 3).map((item: any, i: number) => (
            <div key={i}
              className="relative w-10 h-10 rounded-lg bg-whitewash-off border-2 border-white overflow-hidden shrink-0">
              {item.variant?.product?.image_urls?.[0] && (
                <Image src={item.variant.product.image_urls[0]} alt="" fill className="object-cover" />
              )}
            </div>
          ))}
          {items.length > 3 && (
            <div className="w-10 h-10 rounded-lg bg-whitewash-off border-2 border-white flex items-center justify-center">
              <span className="text-xs text-brown-light">+{items.length - 3}</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs text-brown-light">
            {items.map((i: any) => i.variant?.product?.name).filter(Boolean).join(', ')}
          </p>
        </div>
        <p className="text-sm font-medium text-brown">{formatPrice(order.total, order.currency)}</p>
      </div>
    </Link>
  )
}