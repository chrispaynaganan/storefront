-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Users (mirrors Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Addresses
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  line1 text not null,
  line2 text,
  city text not null,
  province text not null,
  country text not null default 'Philippines',
  postal_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- Collections
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_urls text[] not null default '{}',
  is_bestseller boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Variants
create table public.variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text,
  stock_qty integer not null default 0,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  sku text unique,
  created_at timestamptz not null default now()
);

-- Promos
create table public.promos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  code text not null unique,
  type text not null check (type in ('percent', 'fixed')),
  value numeric(10,2) not null,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  address_id uuid not null references public.addresses(id),
  status text not null default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled')),
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  currency text not null default 'PHP',
  paypal_order_id text,
  created_at timestamptz not null default now()
);

-- Order items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.variants(id),
  qty integer not null,
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);

-- Cart items
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  variant_id uuid not null references public.variants(id) on delete cascade,
  qty integer not null default 1,
  added_at timestamptz not null default now(),
  unique(user_id, variant_id)
);
