alter table public.custom_order_requests
  add column if not exists project_category text,
  add column if not exists occasion text,
  add column if not exists dimensions text,
  add column if not exists preferred_materials text,
  add column if not exists preferred_colors text,
  add column if not exists flexibility jsonb not null default '{}'::jsonb;

alter table public.custom_order_milestones
  add column if not exists requires_buyer_approval boolean not null default false,
  add column if not exists buyer_approved_at timestamptz,
  add column if not exists buyer_approval_note text;
