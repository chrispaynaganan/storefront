export type UserRole = 'customer' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  line1: string
  line2: string | null
  city: string
  province: string
  country: string
  postal_code: string
  is_default: boolean
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  collection_id: string | null
  name: string
  slug: string
  description: string | null
  image_urls: string[]
  is_bestseller: boolean
  is_active: boolean
  audience: string | null
  product_type: string | null
  created_at: string
  collection?: Collection
  variants?: Variant[]
}

export interface Variant {
  id: string
  product_id: string
  size: string
  color: string | null
  color_hex: string | null
  stock_qty: number
  price: number
  compare_at_price: number | null
  sku: string | null
}

export interface Promo {
  id: string
  product_id: string | null
  code: string
  type: 'percent' | 'fixed'
  value: number
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
}

export interface CartItem {
  id: string
  user_id: string
  variant_id: string
  qty: number
  added_at: string
  variant?: Variant & { product?: Product }
}

export interface Order {
  id: string
  user_id: string
  address_id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  discount: number
  total: number
  currency: string
  paypal_order_id: string | null
  created_at: string
  address?: Address
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  variant_id: string
  qty: number
  unit_price: number
  line_total: number
  variant?: Variant & { product?: Product }
}