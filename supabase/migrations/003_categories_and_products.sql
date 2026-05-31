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
