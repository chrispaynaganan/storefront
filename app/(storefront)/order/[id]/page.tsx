import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { formatPrice, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface Props { params: Promise<{ id: string }> }

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params
  const user = await getUser()
  const supabase = await createServerSupabaseClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, address:addresses(*), items:order_items(*, variant:variants(*, product:products(*)))')
    .eq('id', id)
    .single()

  if (!order) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-[#FFCBA4] mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl text-[#3B1F0E]">✓</span>
        </div>
        <h1 className="text-3xl font-light text-[#3B1F0E] mb-2">Order confirmed!</h1>
        <p className="text-[#6B3A22]">Order #{id.slice(0, 8).toUpperCase()}</p>
        <p className="text-sm text-[#6B3A22] mt-1">{formatDate(order.created_at)}</p>
      </div>

      <div className="bg-white rounded-xl border border-[#FFE8D6] p-6 mb-6">
        <h2 className="font-medium text-[#3B1F0E] mb-4">Items ordered</h2>
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-[#3B1F0E]">
                {item.variant?.product?.name} — {item.variant?.size} × {item.qty}
              </span>
              <span className="text-[#3B1F0E]">{formatPrice(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#FFE8D6] mt-4 pt-3 flex justify-between font-medium text-[#3B1F0E]">
          <span>Total paid</span>
          <span>{formatPrice(order.total, order.currency)}</span>
        </div>
      </div>

      {order.address && (
        <div className="bg-white rounded-xl border border-[#FFE8D6] p-6 mb-8">
          <h2 className="font-medium text-[#3B1F0E] mb-2">Shipping to</h2>
          <p className="text-sm text-[#6B3A22]">{order.address.line1}</p>
          {order.address.line2 && <p className="text-sm text-[#6B3A22]">{order.address.line2}</p>}
          <p className="text-sm text-[#6B3A22]">{order.address.city}, {order.address.province}</p>
          <p className="text-sm text-[#6B3A22]">{order.address.country} {order.address.postal_code}</p>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Link href="/account/orders">
          <Button variant="outline" className="border-[#3B1F0E] text-[#3B1F0E] px-6 py-2.5 rounded-lg">
            View orders
          </Button>
        </Link>
        <Link href="/products">
          <Button className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] px-6 py-2.5 rounded-lg">
            Continue shopping
          </Button>
        </Link>
      </div>
    </div>
  )
}