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
