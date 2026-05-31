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
