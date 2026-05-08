import { getUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import Image from 'next/image'
import Link from 'next/link'

interface Props { params: Promise<{ id: string }> }

export default async function AccountOrderDetailPage({ params }: Props) {
  const { id } = await params
  const user = await getUser()
  const supabase = await createServerSupabaseClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, address:addresses(*), items:order_items(*, variant:variants(*, product:products(*)))')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!order) notFound()

  const statusVariant: Record<string, any> = {
    pending: 'peach', paid: 'success', shipped: 'warning',
    delivered: 'success', cancelled: 'danger',
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-[#6B3A22] mb-6">
        <Link href="/account/orders" className="hover:text-[#3B1F0E]">Orders</Link>
        <span>/</span>
        <span className="text-[#3B1F0E]">#{order.id.slice(0, 8).toUpperCase()}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-[#3B1F0E]">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-[#6B3A22] mt-1">{formatDate(order.created_at)}</p>
        </div>
        <Badge variant={statusVariant[order.status]}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-[#FFE8D6] p-5 mb-4">
        <h2 className="font-medium text-[#3B1F0E] mb-4">Items</h2>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative w-16 h-16 bg-[#F2EDE8] rounded-lg overflow-hidden flex-shrink-0">
                {item.variant?.product?.image_urls?.[0] && (
                  <Image src={item.variant.product.image_urls[0]} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#3B1F0E]">{item.variant?.product?.name}</p>
                <p className="text-xs text-[#6B3A22]">Size: {item.variant?.size} × {item.qty}</p>
              </div>
              <p className="text-sm text-[#3B1F0E]">{formatPrice(item.line_total)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-[#FFE8D6] mt-4 pt-3 space-y-1">
          <div className="flex justify-between text-sm text-[#6B3A22]">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span><span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-medium text-[#3B1F0E]">
            <span>Total</span><span>{formatPrice(order.total, order.currency)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {order.address && (
        <div className="bg-white rounded-xl border border-[#FFE8D6] p-5">
          <h2 className="font-medium text-[#3B1F0E] mb-3">Shipping address</h2>
          <p className="text-sm text-[#6B3A22]">{order.address.line1}</p>
          {order.address.line2 && <p className="text-sm text-[#6B3A22]">{order.address.line2}</p>}
          <p className="text-sm text-[#6B3A22]">{order.address.city}, {order.address.province}</p>
          <p className="text-sm text-[#6B3A22]">{order.address.country} {order.address.postal_code}</p>
        </div>
      )}
    </div>
  )
}