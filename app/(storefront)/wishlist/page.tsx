import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { getFavoritedProductIds } from '@/lib/favorites'
import { ProductGrid } from '@/components/products/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const metadata = { title: 'Wishlist — Known & Worn' }

export default async function WishlistPage() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-light text-brown mb-4">Your wishlist</h1>
        <p className="text-brown-light mb-6">Sign in to see your saved items</p>
        <Link href="/login">
          <Button className="bg-brown text-whitewash hover:bg-brown-light px-8 py-3 rounded-lg">
            Sign in
          </Button>
        </Link>
      </div>
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data: favorites } = await supabase
    .from('favorites')
    .select('product_id, products(*, variants(*))')
    .eq('user_id', user.id)
    .order('product_id')

  const products = (favorites ?? [])
    .map((f: any) => f.products)
    .filter(Boolean)

  const favoritedIds = await getFavoritedProductIds()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-light text-brown mb-8">
        Wishlist {products.length > 0 && `(${products.length})`}
      </h1>

      {products.length === 0 ? (
        <EmptyState
          message="Your wishlist is empty."
          submessage="Save items you love and find them here later."
          action={
            <Link href="/products">
              <Button className="bg-brown text-whitewash hover:bg-brown-light px-6 py-2.5 rounded-lg">
                Browse products
              </Button>
            </Link>
          }
        />
      ) : (
        <ProductGrid products={products} favoritedIds={favoritedIds} />
      )}
    </div>
  )
}