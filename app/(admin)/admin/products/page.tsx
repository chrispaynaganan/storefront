import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'

export const metadata = { title: 'Products — Admin' }

export default async function AdminProductsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, variants(*), collections(*)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-[#3B1F0E]">Products</h1>
          <p className="text-sm text-[#6B3A22] mt-1">{products?.length ?? 0} total</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] rounded-lg px-4 py-2.5 text-sm">
            + Add product
          </Button>
        </Link>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {products?.map(p => {
          const lowestPrice = p.variants?.length
            ? Math.min(...p.variants.map((v: any) => v.price))
            : null
          return (
            <div key={p.id} className="bg-white rounded-xl border border-[#FFE8D6] p-4 flex gap-3">
              <div className="w-14 h-14 rounded-lg bg-[#F2EDE8] flex-shrink-0 overflow-hidden">
                {p.image_urls?.[0] && (
                  <img src={p.image_urls[0]} alt={p.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#3B1F0E] text-sm truncate">{p.name}</p>
                    <p className="text-xs text-[#6B3A22] mt-0.5">{p.collections?.name ?? 'No collection'}</p>
                  </div>
                  <Link href={`/admin/products/${p.id}/edit`}
                    className="text-xs text-[#6B3A22] hover:text-[#3B1F0E] underline flex-shrink-0">
                    Edit
                  </Link>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs text-[#3B1F0E]">{lowestPrice ? formatPrice(lowestPrice) : '—'}</span>
                  <span className="text-xs text-[#6B3A22]">{p.variants?.length ?? 0} variants</span>
                  {p.is_bestseller && <Badge variant="peach">Bestseller</Badge>}
                  <Badge variant={p.is_active ? 'success' : 'danger'}>
                    {p.is_active ? 'Active' : 'Draft'}
                  </Badge>
                </div>
              </div>
            </div>
          )
        })}
        {(!products || products.length === 0) && (
          <div className="py-16 text-center text-sm text-[#6B3A22]">
            No products yet. <Link href="/admin/products/new" className="underline">Add your first one.</Link>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-[#FFE8D6] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F4] border-b border-[#FFE8D6]">
            <tr>
              {['Product', 'Collection', 'Variants', 'Price from', 'Status', ''].map(h => (
                <th key={h} className="text-left text-xs text-[#6B3A22] font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FFE8D6]">
            {products?.map(p => {
              const lowestPrice = p.variants?.length
                ? Math.min(...p.variants.map((v: any) => v.price))
                : null
              return (
                <tr key={p.id} className="hover:bg-[#FAF7F4] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F2EDE8] flex-shrink-0 overflow-hidden">
                        {p.image_urls?.[0] && (
                          <img src={p.image_urls[0]} alt={p.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#3B1F0E]">{p.name}</p>
                        <p className="text-xs text-[#6B3A22]">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#6B3A22]">{p.collections?.name ?? '—'}</td>
                  <td className="px-5 py-4 text-[#6B3A22]">{p.variants?.length ?? 0}</td>
                  <td className="px-5 py-4 text-[#3B1F0E]">{lowestPrice ? formatPrice(lowestPrice) : '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {p.is_bestseller && <Badge variant="peach">Bestseller</Badge>}
                      <Badge variant={p.is_active ? 'success' : 'danger'}>
                        {p.is_active ? 'Active' : 'Draft'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/products/${p.id}/edit`}
                      className="text-xs text-[#6B3A22] hover:text-[#3B1F0E] underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!products || products.length === 0) && (
          <div className="py-16 text-center text-sm text-[#6B3A22]">
            No products yet. <Link href="/admin/products/new" className="underline">Add your first one.</Link>
          </div>
        )}
      </div>
    </div>
  )
}