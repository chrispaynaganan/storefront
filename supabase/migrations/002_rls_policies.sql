-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.addresses enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.promos enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;

-- Public read on products/collections/variants/promos
create policy "Public can read active collections" on public.collections for select using (is_active = true);
create policy "Public can read active products" on public.products for select using (is_active = true);
create policy "Public can read variants" on public.variants for select using (true);
create policy "Public can read active promos" on public.promos for select using (is_active = true);

-- Users: own row only
create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Addresses: own rows only
create policy "Users can manage own addresses" on public.addresses for all using (auth.uid() = user_id);

-- Cart: own rows only
create policy "Users can manage own cart" on public.cart_items for all using (auth.uid() = user_id);

-- Orders: own rows only
create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Users can read own order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Admin: full access via service role (handled in API routes)
