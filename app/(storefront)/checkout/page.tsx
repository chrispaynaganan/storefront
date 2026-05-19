import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CheckoutClient from '@/components/checkout/CheckoutClient'
import Image from 'next/image'

export const metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()

  const [{ data: cartItems }, { data: addresses }] = await Promise.all([
    supabase
      .from('cart_items')
      .select('*, variant:variants(*, product:products(*))')
      .eq('user_id', user.id)
      .order('added_at', { ascending: true }),
    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false }),
  ])

  if (!cartItems?.length) redirect('/cart')

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.variant?.price ?? 0) * item.qty,
    0
  )

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount)

  const orderSummary = (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-brown">
        Order summary
      </h2>
      <ul className="space-y-4">
        {cartItems.map((item) => {
          const product = item.variant?.product
          const imageUrls: string[] = product?.image_urls ?? []
          const imageUrl = imageUrls[0] ?? null
          return (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-whitewash-off">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product?.name ?? 'Product'}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="h-full w-full bg-whitewash-off" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-sm font-medium text-brown">{product?.name}</p>
                <p className="text-xs text-brown/60">
                  {item.variant?.size && `Size ${item.variant.size}`}
                  {item.variant?.size && item.variant?.color && ' · '}
                  {item.variant?.color}
                </p>
                <p className="text-xs text-brown/60">Qty: {item.qty}</p>
              </div>
              <p className="shrink-0 text-sm font-medium text-brown">
                {formatPrice((item.variant?.price ?? 0) * item.qty)}
              </p>
            </li>
          )
        })}
      </ul>
      <div className="mt-6 space-y-2 border-t border-whitewash-off pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-brown/60">Subtotal</span>
          <span className="text-sm text-brown">{formatPrice(cartTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-brown/60">Shipping</span>
          <span className="text-xs text-brown/50">Calculated at next step</span>
        </div>
        <div className="flex items-center justify-between border-t border-whitewash-off pt-3">
          <span className="font-medium text-brown">Total</span>
          <span className="font-medium text-brown">{formatPrice(cartTotal)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-whitewash px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 font-gelasio text-2xl text-brown md:text-3xl">Checkout</h1>
        <CheckoutClient
          userId={user.id}
          userEmail={user.email ?? ''}
          cartTotal={cartTotal}
          savedAddresses={addresses ?? []}
          orderSummary={orderSummary}
        />
      </div>
    </main>
  )
}