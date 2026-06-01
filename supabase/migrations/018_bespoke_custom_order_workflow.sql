alter type public.bespoke_order_status add value if not exists 'quote_declined';
alter type public.bespoke_order_status add value if not exists 'revision_requested';

create sequence if not exists public.custom_order_request_number_seq;

create or replace function public.generate_custom_request_number()
returns text
language plpgsql
as $$
begin
  return 'CUSTOM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.custom_order_request_number_seq')::text, 6, '0');
end;
$$;

alter table public.custom_order_requests
  alter column request_number set default public.generate_custom_request_number(),
  add column if not exists buyer_notes text,
  add column if not exists seller_notes text,
  add column if not exists admin_notes text;

alter table public.custom_order_quotes
  drop constraint if exists custom_order_quotes_request_id_key,
  add column if not exists quote_version integer not null default 1,
  add column if not exists inclusions jsonb not null default '[]'::jsonb,
  add column if not exists exclusions jsonb not null default '[]'::jsonb,
  add column if not exists status text not null default 'sent',
  add column if not exists declined_at timestamptz;

create unique index if not exists custom_order_quotes_request_version_idx
  on public.custom_order_quotes(request_id, quote_version);

alter table public.custom_order_quotes
  add constraint custom_order_quote_amounts_reconcile
  check (quote_amount = deposit_amount + final_amount);

alter table public.custom_order_quotes
  add constraint custom_order_quote_status_check
  check (status in ('draft','sent','accepted','declined','revision_requested','superseded'));

create or replace function public.prevent_accepted_quote_mutation()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'accepted'
    and (
      new.quote_amount is distinct from old.quote_amount or
      new.deposit_amount is distinct from old.deposit_amount or
      new.final_amount is distinct from old.final_amount or
      new.estimated_completion_date is distinct from old.estimated_completion_date or
      new.quote_notes is distinct from old.quote_notes or
      new.inclusions is distinct from old.inclusions or
      new.exclusions is distinct from old.exclusions
    )
  then
    raise exception 'Accepted quotes are immutable.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_accepted_quote_mutation on public.custom_order_quotes;
create trigger prevent_accepted_quote_mutation
before update on public.custom_order_quotes
for each row execute function public.prevent_accepted_quote_mutation();

alter table public.custom_order_milestones
  add column if not exists image_paths jsonb not null default '[]'::jsonb,
  add column if not exists display_order integer not null default 0,
  add column if not exists status text not null default 'pending',
  add column if not exists is_visible_to_buyer boolean not null default true,
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

update public.custom_order_milestones
set image_paths = case when image_url is not null then jsonb_build_array(image_url) else image_paths end,
    status = case when is_completed then 'completed' else status end
where image_url is not null or is_completed = true;

alter table public.custom_order_milestones
  add constraint custom_order_milestone_status_check
  check (status in ('pending','in_progress','completed'));

create table if not exists public.custom_order_payment_records (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_order_requests(id) on delete cascade,
  payment_type text not null check (payment_type in ('deposit','final_payment','adjustment')),
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','marked_paid','cancelled')),
  payment_reference text,
  marked_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_order_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_order_requests(id) on delete cascade,
  status public.bespoke_order_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create trigger custom_order_payment_records_updated_at
before update on public.custom_order_payment_records
for each row execute function public.set_updated_at();

create or replace function public.insert_custom_order_status_history()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.custom_order_status_history(request_id, status, note, changed_by)
    values (new.id, new.status, case when tg_op = 'INSERT' then 'Custom request submitted by buyer.' else 'Status changed.' end, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists custom_order_status_history_trigger on public.custom_order_requests;
create trigger custom_order_status_history_trigger
after insert or update of status on public.custom_order_requests
for each row execute function public.insert_custom_order_status_history();

create index if not exists custom_order_requests_buyer_idx on public.custom_order_requests(buyer_id, created_at desc);
create index if not exists custom_order_requests_seller_idx on public.custom_order_requests(seller_id, status, created_at desc);
create index if not exists custom_order_quotes_request_idx on public.custom_order_quotes(request_id, quote_version desc);
create index if not exists custom_order_milestones_request_idx on public.custom_order_milestones(request_id, display_order);
create index if not exists custom_order_payment_records_request_idx on public.custom_order_payment_records(request_id, payment_type);
create index if not exists custom_order_status_history_request_idx on public.custom_order_status_history(request_id, created_at);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'custom-order-milestone-files',
  'custom-order-milestone-files',
  false,
  5242880,
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.custom_order_payment_records enable row level security;
alter table public.custom_order_status_history enable row level security;

drop policy if exists custom_requests_participants on public.custom_order_requests;
drop policy if exists custom_requests_buyer_insert on public.custom_order_requests;
drop policy if exists custom_requests_participant_update on public.custom_order_requests;
drop policy if exists quotes_participants_read on public.custom_order_quotes;
drop policy if exists quotes_seller_manage on public.custom_order_quotes;
drop policy if exists milestones_participants_read on public.custom_order_milestones;
drop policy if exists milestones_seller_manage on public.custom_order_milestones;
drop policy if exists custom_order_payment_records_read on public.custom_order_payment_records;
drop policy if exists custom_order_payment_records_admin_manage on public.custom_order_payment_records;
drop policy if exists custom_order_status_history_read on public.custom_order_status_history;
drop policy if exists custom_order_status_history_admin_insert on public.custom_order_status_history;

create policy custom_requests_participants on public.custom_order_requests
for select using (
  buyer_id = auth.uid()
  or public.owns_seller_profile(seller_id)
  or public.is_admin()
);

create policy custom_requests_buyer_insert on public.custom_order_requests
for insert with check (buyer_id = auth.uid());

create policy custom_requests_participant_update on public.custom_order_requests
for update using (
  public.owns_seller_profile(seller_id)
  or public.is_admin()
) with check (
  public.owns_seller_profile(seller_id)
  or public.is_admin()
);

create policy quotes_participants_read on public.custom_order_quotes
for select using (
  exists (
    select 1 from public.custom_order_requests r
    where r.id = request_id
      and (r.buyer_id = auth.uid() or public.owns_seller_profile(r.seller_id) or public.is_admin())
  )
);

create policy quotes_seller_insert on public.custom_order_quotes
for insert with check (public.owns_seller_profile(seller_id) or public.is_admin());

create policy quotes_seller_update on public.custom_order_quotes
for update using (public.owns_seller_profile(seller_id) or public.is_admin())
with check (public.owns_seller_profile(seller_id) or public.is_admin());

create policy milestones_participants_read on public.custom_order_milestones
for select using (
  exists (
    select 1 from public.custom_order_requests r
    where r.id = request_id
      and (
        (r.buyer_id = auth.uid() and is_visible_to_buyer = true)
        or public.owns_seller_profile(r.seller_id)
        or public.is_admin()
      )
  )
);

create policy milestones_seller_manage on public.custom_order_milestones
for all using (
  exists (
    select 1 from public.custom_order_requests r
    where r.id = request_id
      and (public.owns_seller_profile(r.seller_id) or public.is_admin())
  )
) with check (
  exists (
    select 1 from public.custom_order_requests r
    where r.id = request_id
      and (public.owns_seller_profile(r.seller_id) or public.is_admin())
  )
);

create policy custom_order_payment_records_read on public.custom_order_payment_records
for select using (
  exists (
    select 1 from public.custom_order_requests r
    where r.id = request_id
      and (r.buyer_id = auth.uid() or public.owns_seller_profile(r.seller_id) or public.is_admin())
  )
);

create policy custom_order_payment_records_admin_manage on public.custom_order_payment_records
for all using (public.is_admin()) with check (public.is_admin());

create policy custom_order_status_history_read on public.custom_order_status_history
for select using (
  exists (
    select 1 from public.custom_order_requests r
    where r.id = request_id
      and (r.buyer_id = auth.uid() or public.owns_seller_profile(r.seller_id) or public.is_admin())
  )
);

create policy custom_order_status_history_admin_insert on public.custom_order_status_history
for insert with check (public.is_admin());

drop policy if exists storage_custom_order_milestone_files_owner on storage.objects;
create policy storage_custom_order_milestone_files_owner on storage.objects
for all using (
  bucket_id = 'custom-order-milestone-files'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.custom_order_requests r
      join public.seller_profiles sp on sp.id = r.seller_id
      where r.id::text = (storage.foldername(name))[2]
        and (sp.user_id = auth.uid() or r.buyer_id = auth.uid())
    )
  )
) with check (
  bucket_id = 'custom-order-milestone-files'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.custom_order_requests r
      join public.seller_profiles sp on sp.id = r.seller_id
      where r.id::text = (storage.foldername(name))[2]
        and sp.user_id = auth.uid()
    )
  )
);
