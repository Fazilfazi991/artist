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

