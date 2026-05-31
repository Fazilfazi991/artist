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
