import { StatsCard } from '@/components/admin/StatsCard'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  // TODO: fetch stats (total orders, revenue, customers, products)
  return (
    <div>
      <h1 className="text-2xl font-light text-brown mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total orders" value="—" />
        <StatsCard label="Revenue" value="—" />
        <StatsCard label="Customers" value="—" />
        <StatsCard label="Products" value="—" />
      </div>
    </div>
  )
}
