-- Sprint 4 artisan storefront templates and mini-sites.

alter table public.seller_collections
  add column if not exists image_url text,
  add column if not exists is_active boolean not null default true;

create table if not exists public.storefront_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text unique not null,
  name text not null,
  description text,
  suitable_for text[],
  preview_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.storefront_settings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null unique references public.seller_profiles(id) on delete cascade,
  template_key text references public.storefront_templates(template_key) default 'warm-editorial',
  custom_subdomain text unique,
  logo_url text,
  favicon_url text,
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  announcement_text text,
  accent_color text,
  about_title text,
  about_content text,
  artisan_story text,
  craft_process_content text,
  shipping_policy text,
  return_policy text,
  production_timeline_note text,
  custom_order_policy_note text,
  contact_email text,
  whatsapp_number text,
  instagram_url text,
  custom_orders_enabled boolean not null default true,
  custom_order_cta_text text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint storefront_subdomain_format check (custom_subdomain is null or custom_subdomain ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint storefront_accent_color_format check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{6}$')
);

create table if not exists public.storefront_social_links (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  platform text not null,
  url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.storefront_sections (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(id) on delete cascade,
  section_type text not null,
  title text,
  content jsonb,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists storefront_settings_seller_id_idx on public.storefront_settings(seller_id);
create index if not exists storefront_settings_custom_subdomain_idx on public.storefront_settings(custom_subdomain);
create index if not exists seller_collections_seller_active_idx on public.seller_collections(seller_id, is_active, display_order);

insert into public.storefront_templates (template_key, name, description, suitable_for, preview_image_url) values
  ('warm-editorial', 'Warm Editorial', 'Story-led, warm, artisanal storefront for pottery, decor, textiles, and painted crafts.', array['Pottery','Decor','Textiles','Painted crafts'], '/artisan-hero.png'),
  ('clean-grid', 'Clean Grid', 'Minimal, product-first storefront for jewellery, candles, accessories, and ready-to-ship catalogues.', array['Jewellery','Candles','Accessories','Ready-to-ship'], '/artisan-hero.png'),
  ('personalized-gifts', 'Personalized Gifts', 'Occasion and customization focused storefront for scrapbooks, hampers, name boards, and wedding gifts.', array['Scrapbooks','Hampers','Name boards','Wedding gifts'], '/artisan-hero.png'),
  ('visual-portfolio', 'Visual Portfolio', 'Image-heavy creative storefront for illustrators, painters, macrame artists, and decor creators.', array['Illustrators','Painters','Macrame','Decor'], '/artisan-hero.png'),
  ('boutique-brand', 'Boutique Brand', 'Elegant mini-brand storefront for premium gifting and curated lifestyle products.', array['Premium gifting','Lifestyle','Curated products'], '/artisan-hero.png')
on conflict (template_key) do update set
  name = excluded.name,
  description = excluded.description,
  suitable_for = excluded.suitable_for,
  preview_image_url = excluded.preview_image_url,
  is_active = true;

insert into public.storefront_settings (seller_id, template_key, custom_subdomain, hero_title, hero_subtitle, about_title, about_content, artisan_story, craft_process_content, custom_order_cta_text, is_published)
select sp.id, 'warm-editorial', sp.store_slug, sp.store_name, sp.short_bio, 'About ' || sp.store_name, coalesce(sp.full_story, sp.short_bio), coalesce(sp.full_story, sp.short_bio), 'Each piece is made with patient hands, careful materials, and a small-batch process.', 'Request a custom piece', true
from public.seller_profiles sp
where sp.status = 'approved'
on conflict (seller_id) do nothing;

insert into public.seller_collections (seller_id, name, slug, description, display_order, is_featured, is_active)
select sp.id, starter.name, starter.slug, starter.description, starter.display_order, starter.is_featured, true
from public.seller_profiles sp
cross join (values
  ('Featured', 'featured', 'Handpicked pieces from this storefront.', 0, true),
  ('New Arrivals', 'new-arrivals', 'Fresh work recently added by the artisan.', 1, false)
) as starter(name, slug, description, display_order, is_featured)
where sp.status = 'approved'
on conflict (seller_id, slug) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('storefront-logos', 'storefront-logos', true, 2097152, array['image/png','image/jpeg','image/webp']),
  ('storefront-heroes', 'storefront-heroes', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('storefront-gallery', 'storefront-gallery', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('collection-images', 'collection-images', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create trigger storefront_settings_updated_at before update on public.storefront_settings for each row execute function public.set_updated_at();
create trigger storefront_social_links_updated_at before update on public.storefront_social_links for each row execute function public.set_updated_at();
create trigger storefront_sections_updated_at before update on public.storefront_sections for each row execute function public.set_updated_at();

alter table public.storefront_templates enable row level security;
alter table public.storefront_settings enable row level security;
alter table public.storefront_social_links enable row level security;
alter table public.storefront_sections enable row level security;

create policy storefront_templates_public_read on public.storefront_templates for select using (is_active or public.is_admin());
create policy storefront_templates_admin_all on public.storefront_templates for all using (public.is_admin()) with check (public.is_admin());

create policy storefront_settings_public_read on public.storefront_settings for select using (
  is_published and exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.status = 'approved')
  or exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid())
  or public.is_admin()
);
create policy storefront_settings_owner_update on public.storefront_settings for update using (exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin()) with check (exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin());
create policy storefront_settings_owner_insert on public.storefront_settings for insert with check (exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin());

create policy storefront_social_public_read on public.storefront_social_links for select using (
  exists (select 1 from public.storefront_settings ss join public.seller_profiles sp on sp.id = ss.seller_id where ss.seller_id = storefront_social_links.seller_id and ss.is_published and sp.status = 'approved')
  or exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid())
  or public.is_admin()
);
create policy storefront_social_owner_manage on public.storefront_social_links for all using (exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin()) with check (exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin());

create policy storefront_sections_public_read on public.storefront_sections for select using (
  is_visible and exists (select 1 from public.storefront_settings ss join public.seller_profiles sp on sp.id = ss.seller_id where ss.seller_id = storefront_sections.seller_id and ss.is_published and sp.status = 'approved')
  or exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid())
  or public.is_admin()
);
create policy storefront_sections_owner_manage on public.storefront_sections for all using (exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin()) with check (exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin());

create policy storage_storefront_assets_owner on storage.objects for all using (
  bucket_id in ('storefront-logos','storefront-heroes','storefront-gallery','collection-images') and (
    public.is_admin() or exists (select 1 from public.seller_profiles sp where sp.id::text = (storage.foldername(name))[1] and sp.user_id = auth.uid())
  )
) with check (
  bucket_id in ('storefront-logos','storefront-heroes','storefront-gallery','collection-images') and (
    public.is_admin() or exists (select 1 from public.seller_profiles sp where sp.id::text = (storage.foldername(name))[1] and sp.user_id = auth.uid())
  )
);