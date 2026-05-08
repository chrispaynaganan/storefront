import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'
import { getUser } from '@/lib/auth'

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  return (
    <ToastProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </CartProvider>
    </ToastProvider>
  )
}
