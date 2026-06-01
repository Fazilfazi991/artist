alter table public.orders
  add column if not exists seller_confirmed_at timestamptz,
  add column if not exists production_started_at timestamptz,
  add column if not exists ready_to_ship_at timestamptz,
  add column if not exists dispatched_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists tracking_url text,
  add column if not exists seller_notes text,
  add column if not exists buyer_delivery_confirmed_at timestamptz,
  add column if not exists issue_reported_at timestamptz;

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at);
create index if not exists orders_order_number_idx on public.orders(order_number);

create table if not exists public.order_progress_updates (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  title text not null,
  message text,
  image_paths jsonb,
  is_visible_to_buyer boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_issues (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  reported_by uuid references public.profiles(id) on delete set null,
  issue_type text not null,
  subject text not null,
  description text not null,
  image_paths jsonb,
  status text not null default 'open',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_issues_type_check check (issue_type in ('delivery_delay','damaged_item','incorrect_item','customization_issue','missing_item','other')),
  constraint order_issues_status_check check (status in ('open','reviewing','resolved','closed'))
);

create index if not exists order_progress_updates_order_id_idx on public.order_progress_updates(order_id);
create index if not exists order_progress_updates_seller_id_idx on public.order_progress_updates(seller_id);
create index if not exists order_issues_order_id_idx on public.order_issues(order_id);
create index if not exists order_issues_reported_by_idx on public.order_issues(reported_by);
create unique index if not exists order_issues_one_open_per_order_reporter_idx
  on public.order_issues(order_id, reported_by)
  where status in ('open','reviewing');

create trigger order_progress_updates_updated_at
  before update on public.order_progress_updates
  for each row execute function public.set_updated_at();

create trigger order_issues_updated_at
  before update on public.order_issues
  for each row execute function public.set_updated_at();

alter table public.order_progress_updates enable row level security;
alter table public.order_issues enable row level security;

drop policy if exists order_progress_buyer_read on public.order_progress_updates;
create policy order_progress_buyer_read on public.order_progress_updates
  for select using (
    is_visible_to_buyer and exists (
      select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()
    )
  );

drop policy if exists order_progress_seller_manage on public.order_progress_updates;
create policy order_progress_seller_manage on public.order_progress_updates
  for all using (public.owns_seller_profile(seller_id) or public.is_admin())
  with check (public.owns_seller_profile(seller_id) or public.is_admin());

drop policy if exists order_issues_participants_read on public.order_issues;
create policy order_issues_participants_read on public.order_issues
  for select using (
    reported_by = auth.uid()
    or public.can_read_order(order_id)
    or public.is_admin()
  );

drop policy if exists order_issues_buyer_insert on public.order_issues;
create policy order_issues_buyer_insert on public.order_issues
  for insert with check (
    reported_by = auth.uid()
    and exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );

drop policy if exists order_issues_admin_update on public.order_issues;
create policy order_issues_admin_update on public.order_issues
  for update using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('order-progress-files', 'order-progress-files', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('order-issue-files', 'order-issue-files', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf'];

drop policy if exists storage_order_progress_files on storage.objects;
create policy storage_order_progress_files on storage.objects
  for all using (
    bucket_id = 'order-progress-files' and (
      public.is_admin()
      or exists (
        select 1 from public.orders o
        join public.seller_profiles sp on sp.id = o.seller_id
        where sp.id::text = (storage.foldername(name))[1]
          and o.id::text = (storage.foldername(name))[2]
          and (sp.user_id = auth.uid() or o.buyer_id = auth.uid())
      )
    )
  )
  with check (
    bucket_id = 'order-progress-files' and (
      public.is_admin()
      or exists (
        select 1 from public.orders o
        join public.seller_profiles sp on sp.id = o.seller_id
        where sp.id::text = (storage.foldername(name))[1]
          and o.id::text = (storage.foldername(name))[2]
          and sp.user_id = auth.uid()
      )
    )
  );

drop policy if exists storage_order_issue_files on storage.objects;
create policy storage_order_issue_files on storage.objects
  for all using (
    bucket_id = 'order-issue-files' and (
      public.is_admin()
      or exists (
        select 1 from public.orders o
        left join public.seller_profiles sp on sp.id = o.seller_id
        where o.id::text = (storage.foldername(name))[2]
          and (o.buyer_id = auth.uid() or sp.user_id = auth.uid())
      )
    )
  )
  with check (
    bucket_id = 'order-issue-files' and (
      public.is_admin()
      or exists (
        select 1 from public.orders o
        where o.id::text = (storage.foldername(name))[2]
          and o.buyer_id = auth.uid()
          and o.buyer_id::text = (storage.foldername(name))[1]
      )
    )
  );
