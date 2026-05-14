import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'
import { getUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const supabase = await createServerSupabaseClient()

  let cartCount = 0
  if (user) {
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    cartCount = count ?? 0
  }

  const { data: saleVariants } = await supabase
    .from('variants')
    .select('id')
    .not('compare_at_price', 'is', null)
    .limit(1)

  const hasSale = (saleVariants?.length ?? 0) > 0

  return (
    <ToastProvider>
      <CartProvider initialCount={cartCount}>
        <div className="flex flex-col min-h-screen">
          <Navbar user={user} hasSale={hasSale} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </CartProvider>
    </ToastProvider>
  )
}