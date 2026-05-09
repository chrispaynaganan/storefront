import { createServerSupabaseClient } from '@/lib/supabase-server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

  const [
    { count: totalOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { data: orders },
    { data: revenueData },
    { count: pendingCount },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('id, total, currency, status, created_at, user:users(full_name, email)').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total').neq('status', 'cancelled'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('variants').select('size, stock_qty, product:products(name)').lt('stock_qty', 5).gt('stock_qty', 0).limit(5),
  ])

  const totalRevenue = (revenueData ?? []).reduce((sum: number, o: any) => sum + o.total, 0)

  const statusVariant: Record<string, any> = {
    pending: 'peach', paid: 'success', shipped: 'warning',
    delivered: 'success', cancelled: 'danger',
  }

  const stats = [
    {
      label: 'Total revenue',
      value: formatPrice(totalRevenue),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
        </svg>
      ),
      bg: 'bg-emerald-50', color: 'text-emerald-600',
    },
    {
      label: 'Total orders',
      value: totalOrders ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
        </svg>
      ),
      bg: 'bg-blue-50', color: 'text-blue-600',
    },
    {
      label: 'Customers',
      value: totalCustomers ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      bg: 'bg-purple-50', color: 'text-purple-600',
    },
    {
      label: 'Active products',
      value: totalProducts ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      ),
      bg: 'bg-[#FFF5EE]', color: 'text-[#3B1F0E]',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-brown">Dashboard</h1>
          <p className="text-sm text-brown-light mt-0.5">Welcome back — here's what's happening.</p>
        </div>
        {(pendingCount ?? 0) > 0 && (
          <Link href="/admin/orders"
            className="flex items-center gap-2 bg-peach text-brown text-xs font-medium px-3 py-2 rounded-full hover:bg-[#ffb980] transition-colors">
            <span className="w-2 h-2 bg-brown rounded-full animate-pulse" />
            {pendingCount} pending {pendingCount === 1 ? 'order' : 'orders'}
          </Link>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-peach-light p-4 md:p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-brown-light uppercase tracking-wide leading-tight">{stat.label}</p>
              <div className={`${stat.bg} ${stat.color} p-1.5 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-light text-brown">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-peach-light overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-peach-light">
            <h2 className="text-sm font-medium text-brown">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-brown-light hover:text-brown underline">
              View all
            </Link>
          </div>
          {(!orders || orders.length === 0) ? (
            <div className="py-12 text-center text-sm text-brown-light">No orders yet.</div>
          ) : (
            <div className="divide-y divide-peach-light">
              {orders.map((order: any) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-whitewash transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-whitewash-off flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-brown">
                        {(order.user?.full_name || order.user?.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brown">
                        {order.user?.full_name || order.user?.email || 'Guest'}
                      </p>
                      <p className="text-xs text-brown-light">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                    <span className="text-sm font-medium text-brown">
                      {formatPrice(order.total, order.currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-peach-light p-5">
            <h2 className="text-sm font-medium text-brown mb-3">Quick actions</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/products/new', label: 'Add new product', icon: '＋' },
                { href: '/admin/collections', label: 'Manage collections', icon: '⊞' },
                { href: '/admin/promos', label: 'Create promo code', icon: '%' },
                { href: '/admin/orders', label: 'View all orders', icon: '→' },
              ].map(action => (
                <Link key={action.href} href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-whitewash transition-colors group">
                  <span className="w-7 h-7 rounded-md bg-whitewash-off flex items-center justify-center text-sm text-brown shrink-0 group-hover:bg-peach transition-colors">
                    {action.icon}
                  </span>
                  <span className="text-sm text-brown-light group-hover:text-brown transition-colors">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Low stock alert */}
          {lowStock && lowStock.length > 0 && (
            <div className="bg-white rounded-xl border border-peach-light p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                <h2 className="text-sm font-medium text-brown">Low stock</h2>
              </div>
              <div className="space-y-2">
                {lowStock.map((v: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-brown truncate max-w-35">
                        {v.product?.name}
                      </p>
                      <p className="text-xs text-brown-light">Size {v.size}</p>
                    </div>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {v.stock_qty} left
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/admin/products"
                className="block text-xs text-brown-light hover:text-brown underline mt-3">
                Manage inventory →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}