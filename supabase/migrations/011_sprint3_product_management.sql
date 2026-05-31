-- Sprint 3 seller product management and moderation additions.
alter table public.products
  add column if not exists rejection_reason text,
  add column if not exists reviewed_by uuid references public.profiles(id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists submitted_at timestamptz,
  add column if not exists shipping_information text,
  add column if not exists return_policy_note text,
  add column if not exists product_story text,
  add column if not exists tags text[] not null default '{}'::text[];

create table if not exists public.seller_collections (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  display_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, slug),
  constraint seller_collection_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.seller_collection_products (
  collection_id uuid not null references public.seller_collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create trigger seller_collections_updated_at before update on public.seller_collections for each row execute function public.set_updated_at();

alter table public.seller_collections enable row level security;
alter table public.seller_collection_products enable row level security;

create policy seller_collections_public_read on public.seller_collections for select using (
  exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.status = 'approved')
  or public.owns_seller_profile(seller_id)
  or public.is_admin()
);
create policy seller_collections_owner_manage on public.seller_collections for all using (public.owns_seller_profile(seller_id) or public.is_admin()) with check (public.owns_seller_profile(seller_id) or public.is_admin());
create policy seller_collection_products_read on public.seller_collection_products for select using (
  exists (
    select 1 from public.seller_collections sc
    join public.products p on p.id = product_id
    where sc.id = collection_id and (p.status = 'active' or public.owns_seller_profile(sc.seller_id) or public.is_admin())
  )
);
create policy seller_collection_products_owner_manage on public.seller_collection_products for all using (
  exists (select 1 from public.seller_collections sc where sc.id = collection_id and (public.owns_seller_profile(sc.seller_id) or public.is_admin()))
) with check (
  exists (select 1 from public.seller_collections sc join public.products p on p.id = product_id where sc.id = collection_id and sc.seller_id = p.seller_id and (public.owns_seller_profile(sc.seller_id) or public.is_admin()))
);