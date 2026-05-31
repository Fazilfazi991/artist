-- 001_extensions_and_enums.sql
-- Extensions and enums for the marketplace backend foundation.
create extension if not exists pgcrypto with schema public;
create extension if not exists citext with schema public;

create type public.user_role as enum ('buyer', 'seller', 'admin');
create type public.seller_status as enum ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended');
create type public.product_type as enum ('ready_to_ship', 'customized', 'bespoke');
create type public.product_status as enum ('draft', 'pending_review', 'active', 'hidden', 'rejected', 'archived');
create type public.standard_order_status as enum ('pending_payment', 'paid', 'seller_confirmed', 'in_production', 'ready_to_ship', 'dispatched', 'delivered', 'completed', 'cancelled', 'refund_requested', 'refunded');
create type public.bespoke_order_status as enum ('request_submitted', 'seller_reviewing', 'quote_sent', 'quote_approved', 'deposit_paid', 'in_progress', 'final_payment_pending', 'fully_paid', 'ready_for_delivery', 'completed', 'cancelled');
create type public.payout_status as enum ('pending', 'eligible', 'processing', 'paid', 'held', 'cancelled');
create type public.ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 002_profiles_and_sellers.sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'buyer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seller_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  store_name text not null,
  store_slug text not null unique,
  short_bio text,
  full_story text,
  profile_image_url text,
  cover_image_url text,
  primary_category_id uuid,
  years_experience integer check (years_experience is null or years_experience >= 0),
  city text,
  state text,
  instagram_url text,
  whatsapp_number text,
  average_production_days integer check (average_production_days is null or average_production_days >= 0),
  shipping_regions jsonb not null default '[]'::jsonb,
  supports_ready_to_ship boolean not null default false,
  supports_customized boolean not null default false,
  supports_bespoke boolean not null default false,
  status public.seller_status not null default 'draft',
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seller_store_slug_format check (store_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.seller_documents (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  verification_status text not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.promote_approved_seller()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from new.status then
    update public.profiles set role = 'seller', updated_at = now() where id = new.user_id and role <> 'admin';
  end if;
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger seller_profiles_updated_at before update on public.seller_profiles for each row execute function public.set_updated_at();
create trigger seller_documents_updated_at before update on public.seller_documents for each row execute function public.set_updated_at();
create trigger seller_approved_role after update of status on public.seller_profiles for each row execute function public.promote_approved_seller();

-- 003_categories_and_products.sql
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint category_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

alter table public.seller_profiles
  add constraint seller_primary_category_fk foreign key (primary_category_id) references public.categories(id) on delete set null;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  product_type public.product_type not null,
  status public.product_status not null default 'draft',
  base_price numeric(12,2),
  compare_at_price numeric(12,2),
  stock_quantity integer,
  sku text,
  dispatch_days integer,
  production_days integer,
  shipping_fee numeric(12,2) not null default 0,
  is_featured boolean not null default false,
  is_customizable boolean not null default false,
  materials text,
  care_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint product_positive_prices check ((base_price is null or base_price >= 0) and (compare_at_price is null or compare_at_price >= 0) and shipping_fee >= 0),
  constraint ready_to_ship_requires_stock check (product_type <> 'ready_to_ship' or stock_quantity is not null),
  constraint customized_requires_timeline check (product_type <> 'customized' or production_days is not null),
  constraint bespoke_allows_quote_pricing check (product_type = 'bespoke' or base_price is not null)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  price_adjustment numeric(12,2) not null default 0,
  stock_quantity integer,
  created_at timestamptz not null default now()
);

create table public.product_customization_fields (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  field_type text not null,
  placeholder text,
  is_required boolean not null default false,
  options jsonb,
  max_length integer,
  price_adjustment numeric(12,2) not null default 0,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint customization_field_type check (field_type in ('text','textarea','select','color','date','file','number'))
);

create or replace function public.ensure_approved_seller_for_active_product()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'active' and not exists (
    select 1 from public.seller_profiles sp where sp.id = new.seller_id and sp.status = 'approved'
  ) then
    raise exception 'Only approved sellers may publish active products';
  end if;
  return new;
end;
$$;

create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger products_approved_seller before insert or update of status, seller_id on public.products for each row execute function public.ensure_approved_seller_for_active_product();

-- 004_cart_wishlist_and_addresses.sql
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_owner_required check (user_id is not null or session_id is not null)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_data jsonb,
  customization_data jsonb,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'buyer')
  on conflict (id) do nothing;

  insert into public.wishlists (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create trigger carts_updated_at before update on public.carts for each row execute function public.set_updated_at();
create trigger cart_items_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
create trigger addresses_updated_at before update on public.addresses for each row execute function public.set_updated_at();

-- 005_orders_and_commissions.sql
create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
begin
  return 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
end;
$$;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_order_number(),
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid not null references public.seller_profiles(id) on delete restrict,
  status public.standard_order_status not null default 'pending_payment',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  platform_commission numeric(12,2) not null default 0 check (platform_commission >= 0),
  payment_gateway_fee numeric(12,2) not null default 0 check (payment_gateway_fee >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  seller_net_amount numeric(12,2) not null default 0 check (seller_net_amount >= 0),
  payment_reference text,
  shipping_address jsonb not null,
  tracking_number text,
  courier_name text,
  buyer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_snapshot jsonb not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  variant_data jsonb,
  customization_data jsonb,
  created_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.standard_order_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.commission_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  seller_id uuid not null references public.seller_profiles(id) on delete restrict,
  gross_amount numeric(12,2) not null,
  commission_percentage numeric(5,2) not null,
  commission_amount numeric(12,2) not null,
  payment_gateway_fee numeric(12,2) not null default 0,
  seller_net_amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table public.seller_payouts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  status public.payout_status not null default 'pending',
  payout_reference text,
  period_start date,
  period_end date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_commission_percentage()
returns numeric
language sql
stable
as $$
  select coalesce(case when jsonb_typeof(value) = 'number' then value::text::numeric when jsonb_typeof(value) = 'object' then (value->>'percent')::numeric else null end, 8) from public.platform_settings where key = 'marketplace_commission_percentage'
$$;

create or replace function public.record_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create or replace function public.create_commission_record_when_paid()
returns trigger
language plpgsql
as $$
declare
  rate numeric := coalesce(public.current_commission_percentage(), 8);
  commission numeric;
begin
  if new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    commission := round(new.subtotal * rate / 100, 2);
    insert into public.commission_records (order_id, seller_id, gross_amount, commission_percentage, commission_amount, payment_gateway_fee, seller_net_amount)
    values (new.id, new.seller_id, new.subtotal, rate, commission, new.payment_gateway_fee, greatest(new.subtotal - commission - new.payment_gateway_fee, 0))
    on conflict (order_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger platform_settings_updated_at before update on public.platform_settings for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger seller_payouts_updated_at before update on public.seller_payouts for each row execute function public.set_updated_at();
create trigger orders_status_history after insert or update of status on public.orders for each row execute function public.record_order_status_change();
create trigger orders_paid_commission after insert or update of status on public.orders for each row execute function public.create_commission_record_when_paid();


-- 006_custom_orders.sql
create or replace function public.generate_custom_request_number()
returns text
language plpgsql
as $$
begin
  return 'BSP-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
end;
$$;

create table public.custom_order_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique default public.generate_custom_request_number(),
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid not null references public.seller_profiles(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  title text not null,
  description text not null,
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  quantity integer,
  deadline date,
  delivery_location text,
  reference_files jsonb,
  status public.bespoke_order_status not null default 'request_submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_order check (budget_min is null or budget_max is null or budget_min <= budget_max)
);

create table public.custom_order_quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.custom_order_requests(id) on delete cascade,
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  quote_amount numeric(12,2) not null check (quote_amount >= 0),
  deposit_amount numeric(12,2) not null check (deposit_amount >= 0),
  final_amount numeric(12,2) not null check (final_amount >= 0),
  estimated_completion_date date,
  quote_notes text,
  is_accepted boolean not null default false,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.custom_order_milestones (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_order_requests(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger custom_order_requests_updated_at before update on public.custom_order_requests for each row execute function public.set_updated_at();
create trigger custom_order_quotes_updated_at before update on public.custom_order_quotes for each row execute function public.set_updated_at();
create trigger custom_order_milestones_updated_at before update on public.custom_order_milestones for each row execute function public.set_updated_at();

-- 007_reviews_support_notifications.sql
create or replace function public.generate_ticket_number()
returns text
language plpgsql
as $$
begin
  return 'TKT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
end;
$$;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  review_text text not null,
  image_urls jsonb,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, product_id, buyer_id)
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique default public.generate_ticket_number(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  subject text not null,
  description text not null,
  status public.ticket_status not null default 'open',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text not null,
  subtitle text,
  content jsonb,
  is_active boolean not null default true,
  display_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.ensure_completed_order_review()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.orders o
    where o.id = new.order_id
      and o.buyer_id = new.buyer_id
      and o.seller_id = new.seller_id
      and o.status = 'completed'
  ) then
    raise exception 'Reviews require a completed order belonging to the buyer';
  end if;
  return new;
end;
$$;

create trigger reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();
create trigger reviews_completed_order before insert on public.reviews for each row execute function public.ensure_completed_order_review();
create trigger support_tickets_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();

-- 008_storage_buckets.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('seller-covers', 'seller-covers', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('product-images', 'product-images', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('custom-order-files', 'custom-order-files', false, 20971520, array['image/png','image/jpeg','image/webp','application/pdf']),
  ('seller-documents', 'seller-documents', false, 20971520, array['image/png','image/jpeg','image/webp','application/pdf']),
  ('review-images', 'review-images', true, 10485760, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 009_rls_policies.sql
create or replace function public.current_profile_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.current_profile_role() = 'admin', false) $$;

create or replace function public.owns_seller_profile(seller uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.seller_profiles where id = seller and user_id = auth.uid()) $$;

create or replace function public.is_approved_seller(seller uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.seller_profiles where id = seller and user_id = auth.uid() and status = 'approved') $$;

create or replace function public.can_read_order(order_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.orders o
    left join public.seller_profiles sp on sp.id = o.seller_id
    where o.id = order_id and (o.buyer_id = auth.uid() or sp.user_id = auth.uid() or public.is_admin())
  )
$$;

alter table public.profiles enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.seller_documents enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_customization_fields enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.commission_records enable row level security;
alter table public.seller_payouts enable row level security;
alter table public.custom_order_requests enable row level security;
alter table public.custom_order_quotes enable row level security;
alter table public.custom_order_milestones enable row level security;
alter table public.reviews enable row level security;
alter table public.support_tickets enable row level security;
alter table public.notifications enable row level security;
alter table public.platform_settings enable row level security;
alter table public.homepage_sections enable row level security;

create policy profiles_self_select on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy profiles_self_update on public.profiles for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());
revoke update (role) on table public.profiles from anon, authenticated;
create policy seller_public_read on public.seller_profiles for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy seller_owner_insert on public.seller_profiles for insert with check (user_id = auth.uid() and status in ('draft','submitted'));
create policy seller_owner_update on public.seller_profiles for update using (user_id = auth.uid() or public.is_admin()) with check ((user_id = auth.uid() and status <> 'approved' and reviewed_by is null and reviewed_at is null) or public.is_admin());
create policy seller_admin_delete on public.seller_profiles for delete using (public.is_admin());
create policy seller_documents_owner on public.seller_documents for all using (public.owns_seller_profile(seller_id) or public.is_admin()) with check (public.owns_seller_profile(seller_id) or public.is_admin());
create policy categories_public_read on public.categories for select using (is_active or public.is_admin());
create policy categories_admin_all on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy products_public_read on public.products for select using (status = 'active' and exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.status = 'approved'));
create policy products_seller_insert on public.products for insert with check (public.owns_seller_profile(seller_id));
create policy products_seller_update on public.products for update using (public.owns_seller_profile(seller_id) or public.is_admin()) with check ((public.owns_seller_profile(seller_id) and (status <> 'active' or public.is_approved_seller(seller_id))) or public.is_admin());
create policy products_admin_delete on public.products for delete using (public.is_admin());
create policy product_images_read on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy product_images_manage on public.product_images for all using (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin()))) with check (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin())));
create policy product_variants_read on public.product_variants for select using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy product_variants_manage on public.product_variants for all using (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin()))) with check (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin())));
create policy customization_read on public.product_customization_fields for select using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy customization_manage on public.product_customization_fields for all using (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin()))) with check (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin())));
create policy wishlists_owner on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy wishlist_items_owner on public.wishlist_items for all using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())) with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));
create policy carts_owner on public.carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cart_items_owner on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) ;
create policy addresses_owner on public.addresses for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy orders_participants_read on public.orders for select using (buyer_id = auth.uid() or exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin());
create policy orders_admin_all on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy order_items_participants_read on public.order_items for select using (public.can_read_order(order_id));
create policy order_items_admin_all on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy order_history_participants_read on public.order_status_history for select using (public.can_read_order(order_id));
create policy order_history_admin_all on public.order_status_history for all using (public.is_admin()) with check (public.is_admin());
create policy commission_seller_read on public.commission_records for select using (public.owns_seller_profile(seller_id) or public.is_admin());
create policy commission_admin_all on public.commission_records for all using (public.is_admin()) with check (public.is_admin());
create policy payouts_seller_read on public.seller_payouts for select using (public.owns_seller_profile(seller_id) or public.is_admin());
create policy payouts_admin_all on public.seller_payouts for all using (public.is_admin()) with check (public.is_admin());
create policy custom_requests_participants on public.custom_order_requests for select using (buyer_id = auth.uid() or exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin());
create policy custom_requests_buyer_insert on public.custom_order_requests for insert with check (buyer_id = auth.uid());
create policy custom_requests_participant_update on public.custom_order_requests for update using (buyer_id = auth.uid() or exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin());
create policy quotes_participants_read on public.custom_order_quotes for select using (exists (select 1 from public.custom_order_requests r where r.id = request_id and (r.buyer_id = auth.uid() or public.owns_seller_profile(r.seller_id) or public.is_admin())));
create policy quotes_seller_manage on public.custom_order_quotes for all using (public.owns_seller_profile(seller_id) or public.is_admin()) with check (public.owns_seller_profile(seller_id) or public.is_admin());
create policy milestones_participants_read on public.custom_order_milestones for select using (exists (select 1 from public.custom_order_requests r where r.id = request_id and (r.buyer_id = auth.uid() or public.owns_seller_profile(r.seller_id) or public.is_admin())));
create policy milestones_seller_manage on public.custom_order_milestones for all using (exists (select 1 from public.custom_order_requests r where r.id = request_id and (public.owns_seller_profile(r.seller_id) or public.is_admin()))) with check (exists (select 1 from public.custom_order_requests r where r.id = request_id and (public.owns_seller_profile(r.seller_id) or public.is_admin())));
create policy reviews_public_read on public.reviews for select using (is_visible or buyer_id = auth.uid() or public.is_admin());
create policy reviews_buyer_insert on public.reviews for insert with check (buyer_id = auth.uid());
create policy reviews_admin_update on public.reviews for update using (public.is_admin()) with check (public.is_admin());
create policy support_owner_admin on public.support_tickets for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy notifications_owner on public.notifications for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy platform_settings_public_read on public.platform_settings for select using (key in ('marketplace_commission_percentage','marketplace_name','currency') or public.is_admin());
create policy platform_settings_admin_all on public.platform_settings for all using (public.is_admin()) with check (public.is_admin());
create policy homepage_sections_public_read on public.homepage_sections for select using (is_active or public.is_admin());
create policy homepage_sections_admin_all on public.homepage_sections for all using (public.is_admin()) with check (public.is_admin());

create policy storage_public_read on storage.objects for select using (bucket_id in ('avatars','seller-covers','product-images','review-images'));
create policy storage_avatar_owner_insert on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
create policy storage_seller_covers_owner_insert on storage.objects for insert with check (bucket_id = 'seller-covers' and exists (select 1 from public.seller_profiles sp where sp.id::text = (storage.foldername(name))[1] and sp.user_id = auth.uid()));
create policy storage_product_images_approved_seller_insert on storage.objects for insert with check (bucket_id = 'product-images' and exists (select 1 from public.seller_profiles sp where sp.id::text = (storage.foldername(name))[1] and sp.user_id = auth.uid() and sp.status = 'approved'));
create policy storage_review_images_owner_insert on storage.objects for insert with check (bucket_id = 'review-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy storage_seller_documents_owner on storage.objects for all using (bucket_id = 'seller-documents' and (public.is_admin() or exists (select 1 from public.seller_profiles sp where sp.id::text = (storage.foldername(name))[1] and sp.user_id = auth.uid()))) with check (bucket_id = 'seller-documents' and (public.is_admin() or exists (select 1 from public.seller_profiles sp where sp.id::text = (storage.foldername(name))[1] and sp.user_id = auth.uid())));
create policy storage_custom_order_files_owner on storage.objects for all using (bucket_id = 'custom-order-files' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text or exists (select 1 from public.custom_order_requests r join public.seller_profiles sp on sp.id = r.seller_id where r.id::text = (storage.foldername(name))[2] and sp.user_id = auth.uid()))) with check (bucket_id = 'custom-order-files' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text));


-- 010_seed_demo_data.sql
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo.mira@example.com','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Mira Kapoor"}'::jsonb,now(),now()),
  ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo.arjun@example.com','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Arjun Mehta"}'::jsonb,now(),now()),
  ('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo.naina@example.com','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Naina Rao"}'::jsonb,now(),now()),
  ('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo.kabir@example.com','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Kabir Ansari"}'::jsonb,now(),now())
on conflict (id) do nothing;
insert into public.platform_settings (key, value) values
  ('marketplace_commission_percentage', '8'::jsonb),
  ('marketplace_name', '"Artisan Marketplace"'::jsonb),
  ('currency', '"INR"'::jsonb)
on conflict (key) do update set value = excluded.value;

insert into public.categories (id, name, slug, description, image_url, display_order) values
  ('10000000-0000-0000-0000-000000000001','Personalized Gifts','personalized-gifts','Handmade keepsakes made personal.','/seed/categories/personalized-gifts.jpg',1),
  ('10000000-0000-0000-0000-000000000002','Home Decor','home-decor','Decor crafted by Indian artisans.','/seed/categories/home-decor.jpg',2),
  ('10000000-0000-0000-0000-000000000003','Jewellery','jewellery','Small-batch jewellery and adornments.','/seed/categories/jewellery.jpg',3),
  ('10000000-0000-0000-0000-000000000004','Scrapbooks','scrapbooks','Albums, journals, and memory books.','/seed/categories/scrapbooks.jpg',4),
  ('10000000-0000-0000-0000-000000000005','Candles','candles','Poured candles and fragrance rituals.','/seed/categories/candles.jpg',5),
  ('10000000-0000-0000-0000-000000000006','Art and Prints','art-and-prints','Original art, prints, and illustrated goods.','/seed/categories/art-and-prints.jpg',6)
on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url;

insert into public.profiles (id, email, full_name, role) values
  ('20000000-0000-0000-0000-000000000001','demo.mira@example.com','Mira Kapoor','seller'),
  ('20000000-0000-0000-0000-000000000002','demo.arjun@example.com','Arjun Mehta','seller'),
  ('20000000-0000-0000-0000-000000000003','demo.naina@example.com','Naina Rao','seller'),
  ('20000000-0000-0000-0000-000000000004','demo.kabir@example.com','Kabir Ansari','seller')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.seller_profiles (id, user_id, store_name, store_slug, short_bio, full_story, profile_image_url, cover_image_url, primary_category_id, years_experience, city, state, average_production_days, shipping_regions, supports_ready_to_ship, supports_customized, supports_bespoke, status, reviewed_at) values
  ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Mira Clay Studio','mira-clay-studio','Ceramic home objects from Jaipur.','Mira works with stoneware forms inspired by desert architecture and old blue pottery palettes.','/seed/sellers/mira-profile.jpg','/seed/sellers/mira-cover.jpg','10000000-0000-0000-0000-000000000002',9,'Jaipur','Rajasthan',7,'["India"]',true,true,true,'approved',now()),
  ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','Arjun Paper Co','arjun-paper-co','Scrapbooks and paper goods from Pune.','Arjun builds layered paper keepsakes for weddings, milestones, and family archives.','/seed/sellers/arjun-profile.jpg','/seed/sellers/arjun-cover.jpg','10000000-0000-0000-0000-000000000004',6,'Pune','Maharashtra',5,'["India"]',true,true,true,'approved',now()),
  ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003','Naina Silver Lines','naina-silver-lines','Contemporary jewellery from Bengaluru.','Naina mixes silver, enamel, and textile details for everyday pieces with a craft-first finish.','/seed/sellers/naina-profile.jpg','/seed/sellers/naina-cover.jpg','10000000-0000-0000-0000-000000000003',11,'Bengaluru','Karnataka',10,'["India"]',true,true,false,'approved',now()),
  ('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004','Kabir Wick Works','kabir-wick-works','Botanical candles from Lucknow.','Kabir pours small batches with soy wax, attars, and reusable vessels made with local partners.','/seed/sellers/kabir-profile.jpg','/seed/sellers/kabir-cover.jpg','10000000-0000-0000-0000-000000000005',5,'Lucknow','Uttar Pradesh',4,'["India"]',true,true,true,'approved',now())
on conflict (store_slug) do update set status = excluded.status, short_bio = excluded.short_bio, full_story = excluded.full_story;

insert into public.products (seller_id, category_id, name, slug, short_description, description, product_type, status, base_price, stock_quantity, dispatch_days, production_days, shipping_fee, is_featured, is_customizable, materials, care_instructions) values
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Hand-thrown Breakfast Bowl','hand-thrown-breakfast-bowl','Stoneware bowl with hand-painted rim.','Ready-to-ship ceramic bowl made in small batches.','ready_to_ship','active',1450,12,3,null,120,true,false,'Stoneware clay, glaze','Hand wash recommended'),
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Custom Name Tile','custom-name-tile','Personalized ceramic door tile.','Made-to-order tile with chosen name and palette.','customized','active',2200,null,null,9,150,false,true,'Ceramic, glaze','Wipe clean'),
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Bespoke Tableware Set','bespoke-tableware-set','Commission a tableware set.','Quote-based bespoke set for dinner tables and gifting.','bespoke','active',null,null,null,30,0,false,true,'Stoneware','Care guide included'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004','Wedding Memory Scrapbook','wedding-memory-scrapbook','Layered handmade wedding album.','A customized scrapbook with pockets, tags, and illustrated dividers.','customized','active',3800,null,null,12,180,true,true,'Paper, board, fabric','Keep dry'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Mini Gift Explosion Box','mini-gift-explosion-box','Compact personalized gift box.','Ready base design with custom messages and photos.','customized','active',1250,null,null,6,90,false,true,'Cardstock, ribbon','Keep dry'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004','Travel Journal Kit','travel-journal-kit','Ready-to-ship journaling kit.','Hand-bound journal with stickers and pockets.','ready_to_ship','active',990,20,2,null,80,false,false,'Paper, thread','Keep dry'),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','Silver Lotus Studs','silver-lotus-studs','Minimal silver studs.','Everyday lotus-inspired studs in sterling silver.','ready_to_ship','active',1850,15,2,null,100,true,false,'Sterling silver','Store dry'),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','Custom Birthstone Pendant','custom-birthstone-pendant','Pendant with selected birthstone.','Made-to-order pendant with silver chain.','customized','active',3200,null,null,14,120,false,true,'Sterling silver, gemstone','Avoid perfume'),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','Enamel Bangle Pair','enamel-bangle-pair','Colorful enamel bangles.','Ready-to-ship pair in jewel-toned enamel.','ready_to_ship','active',2400,8,3,null,110,false,false,'Silver, enamel','Store separately'),
  ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000005','Rose Attar Soy Candle','rose-attar-soy-candle','Floral soy candle in reusable tin.','Hand-poured candle with rose attar notes.','ready_to_ship','active',850,30,2,null,70,true,false,'Soy wax, cotton wick','Burn within sight'),
  ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000005','Personalized Festive Candle Set','personalized-festive-candle-set','Custom label candle set.','Choose fragrance, label text, and wrapping.','customized','active',1750,null,null,7,100,false,true,'Soy wax, glass','Burn within sight'),
  ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Corporate Gift Candle Hamper','corporate-gift-candle-hamper','Quote-based bulk gifting hamper.','Bespoke candle hamper for teams and events.','bespoke','active',null,null,null,20,0,false,true,'Soy wax, packaging','Care guide included')
on conflict (slug) do update set name = excluded.name, status = excluded.status;

insert into public.homepage_sections (section_key, title, subtitle, content, display_order) values
  ('featured_categories','Featured Categories','Explore craft-led collections','{}'::jsonb,1),
  ('featured_artisans','Featured Artisans','Meet approved makers','{}'::jsonb,2)
on conflict (section_key) do update set title = excluded.title, subtitle = excluded.subtitle;


