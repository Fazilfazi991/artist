alter table public.carts
  add column if not exists checkout_started_at timestamptz;

alter table public.cart_items
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists carts_user_id_idx on public.carts(user_id);
create index if not exists carts_session_id_idx on public.carts(session_id);
create index if not exists cart_items_cart_id_idx on public.cart_items(cart_id);
create index if not exists cart_items_product_id_idx on public.cart_items(product_id);
create index if not exists addresses_user_id_idx on public.addresses(user_id);
create index if not exists orders_buyer_id_idx on public.orders(buyer_id);
create index if not exists orders_seller_id_idx on public.orders(seller_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_status_history_order_id_idx on public.order_status_history(order_id);
create index if not exists commission_records_seller_id_idx on public.commission_records(seller_id);

create unique index if not exists carts_single_user_cart_idx
  on public.carts(user_id)
  where user_id is not null;

create unique index if not exists carts_single_session_cart_idx
  on public.carts(session_id)
  where session_id is not null;

create unique index if not exists addresses_one_default_per_user_idx
  on public.addresses(user_id)
  where is_default;

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  cart_id uuid references public.carts(id) on delete set null,
  status text not null default 'started',
  selected_address_id uuid references public.addresses(id) on delete set null,
  created_order_ids uuid[] not null default '{}',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint checkout_sessions_status_check check (status in ('started','processing','completed','failed'))
);

create index if not exists checkout_sessions_buyer_id_idx on public.checkout_sessions(buyer_id);
create index if not exists checkout_sessions_cart_id_idx on public.checkout_sessions(cart_id);

create or replace function public.ensure_single_default_address()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.addresses
      set is_default = false
      where user_id = new.user_id and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists addresses_single_default on public.addresses;
create trigger addresses_single_default
  after insert or update of is_default on public.addresses
  for each row execute function public.ensure_single_default_address();

create trigger checkout_sessions_updated_at
  before update on public.checkout_sessions
  for each row execute function public.set_updated_at();

alter table public.checkout_sessions enable row level security;

drop policy if exists checkout_sessions_owner_read on public.checkout_sessions;
create policy checkout_sessions_owner_read on public.checkout_sessions
  for select using (buyer_id = auth.uid() or public.is_admin());

drop policy if exists checkout_sessions_owner_insert on public.checkout_sessions;
create policy checkout_sessions_owner_insert on public.checkout_sessions
  for insert with check (buyer_id = auth.uid() or public.is_admin());

drop policy if exists checkout_sessions_owner_update on public.checkout_sessions;
create policy checkout_sessions_owner_update on public.checkout_sessions
  for update using (buyer_id = auth.uid() or public.is_admin())
  with check (buyer_id = auth.uid() or public.is_admin());

insert into public.platform_settings(key, value)
values ('marketplace_commission_percentage', '8'::jsonb)
on conflict (key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'custom-order-files',
  'custom-order-files',
  false,
  5242880,
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf'];
