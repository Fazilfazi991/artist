create or replace function public.current_profile_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.current_profile_role() = 'admin', false) $$;

create or replace function public.owns_seller_profile(seller uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.seller_profiles where id = seller and user_id = auth.uid()) $$;

create or replace function public.is_approved_seller(seller uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.seller_profiles where id = seller and user_id = auth.uid() and status = 'approved') $$;

create or replace function public.can_read_order(order_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.orders o
    left join public.seller_profiles sp on sp.id = o.seller_id
    where o.id = order_id and (o.buyer_id = auth.uid() or sp.user_id = auth.uid() or public.is_admin())
  )
$$;

alter table public.profiles enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.seller_documents enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_customization_fields enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.commission_records enable row level security;
alter table public.seller_payouts enable row level security;
alter table public.custom_order_requests enable row level security;
alter table public.custom_order_quotes enable row level security;
alter table public.custom_order_milestones enable row level security;
alter table public.reviews enable row level security;
alter table public.support_tickets enable row level security;
alter table public.notifications enable row level security;
alter table public.platform_settings enable row level security;
alter table public.homepage_sections enable row level security;

create policy profiles_self_select on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy profiles_self_update on public.profiles for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());
revoke update (role) on table public.profiles from anon, authenticated;
create policy seller_public_read on public.seller_profiles for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy seller_owner_insert on public.seller_profiles for insert with check (user_id = auth.uid() and status in ('draft','submitted'));
create policy seller_owner_update on public.seller_profiles for update using (user_id = auth.uid() or public.is_admin()) with check ((user_id = auth.uid() and status <> 'approved' and reviewed_by is null and reviewed_at is null) or public.is_admin());
create policy seller_admin_delete on public.seller_profiles for delete using (public.is_admin());
create policy seller_documents_owner on public.seller_documents for all using (public.owns_seller_profile(seller_id) or public.is_admin()) with check (public.owns_seller_profile(seller_id) or public.is_admin());
create policy categories_public_read on public.categories for select using (is_active or public.is_admin());
create policy categories_admin_all on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy products_public_read on public.products for select using (status = 'active' and exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.status = 'approved'));
create policy products_seller_insert on public.products for insert with check (public.owns_seller_profile(seller_id));
create policy products_seller_update on public.products for update using (public.owns_seller_profile(seller_id) or public.is_admin()) with check ((public.owns_seller_profile(seller_id) and (status <> 'active' or public.is_approved_seller(seller_id))) or public.is_admin());
create policy products_admin_delete on public.products for delete using (public.is_admin());
create policy product_images_read on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy product_images_manage on public.product_images for all using (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin()))) with check (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin())));
create policy product_variants_read on public.product_variants for select using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy product_variants_manage on public.product_variants for all using (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin()))) with check (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin())));
create policy customization_read on public.product_customization_fields for select using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy customization_manage on public.product_customization_fields for all using (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin()))) with check (exists (select 1 from public.products p where p.id = product_id and (public.owns_seller_profile(p.seller_id) or public.is_admin())));
create policy wishlists_owner on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy wishlist_items_owner on public.wishlist_items for all using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())) with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));
create policy carts_owner on public.carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cart_items_owner on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) ;
create policy addresses_owner on public.addresses for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy orders_participants_read on public.orders for select using (buyer_id = auth.uid() or exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin());
create policy orders_admin_all on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy order_items_participants_read on public.order_items for select using (public.can_read_order(order_id));
create policy order_items_admin_all on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy order_history_participants_read on public.order_status_history for select using (public.can_read_order(order_id));
create policy order_history_admin_all on public.order_status_history for all using (public.is_admin()) with check (public.is_admin());
create policy commission_seller_read on public.commission_records for select using (public.owns_seller_profile(seller_id) or public.is_admin());
create policy commission_admin_all on public.commission_records for all using (public.is_admin()) with check (public.is_admin());
create policy payouts_seller_read on public.seller_payouts for select using (public.owns_seller_profile(seller_id) or public.is_admin());
create policy payouts_admin_all on public.seller_payouts for all using (public.is_admin()) with check (public.is_admin());
create policy custom_requests_participants on public.custom_order_requests for select using (buyer_id = auth.uid() or exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin());
create policy custom_requests_buyer_insert on public.custom_order_requests for insert with check (buyer_id = auth.uid());
create policy custom_requests_participant_update on public.custom_order_requests for update using (buyer_id = auth.uid() or exists (select 1 from public.seller_profiles sp where sp.id = seller_id and sp.user_id = auth.uid()) or public.is_admin());
create policy quotes_participants_read on public.custom_order_quotes for select using (exists (select 1 from public.custom_order_requests r where r.id = request_id and (r.buyer_id = auth.uid() or public.owns_seller_profile(r.seller_id) or public.is_admin())));
create policy quotes_seller_manage on public.custom_order_quotes for all using (public.owns_seller_profile(seller_id) or public.is_admin()) with check (public.owns_seller_profile(seller_id) or public.is_admin());
create policy milestones_participants_read on public.custom_order_milestones for select using (exists (select 1 from public.custom_order_requests r where r.id = request_id and (r.buyer_id = auth.uid() or public.owns_seller_profile(r.seller_id) or public.is_admin())));
create policy milestones_seller_manage on public.custom_order_milestones for all using (exists (select 1 from public.custom_order_requests r where r.id = request_id and (public.owns_seller_profile(r.seller_id) or public.is_admin()))) with check (exists (select 1 from public.custom_order_requests r where r.id = request_id and (public.owns_seller_profile(r.seller_id) or public.is_admin())));
create policy reviews_public_read on public.reviews for select using (is_visible or buyer_id = auth.uid() or public.is_admin());
create policy reviews_buyer_insert on public.reviews for insert with check (buyer_id = auth.uid());
create policy reviews_admin_update on public.reviews for update using (public.is_admin()) with check (public.is_admin());
create policy support_owner_admin on public.support_tickets for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy notifications_owner on public.notifications for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy platform_settings_public_read on public.platform_settings for select using (key in ('marketplace_commission_percentage','marketplace_name','currency') or public.is_admin());
create policy platform_settings_admin_all on public.platform_settings for all using (public.is_admin()) with check (public.is_admin());
create policy homepage_sections_public_read on public.homepage_sections for select using (is_active or public.is_admin());
create policy homepage_sections_admin_all on public.homepage_sections for all using (public.is_admin()) with check (public.is_admin());

create policy storage_public_read on storage.objects for select using (bucket_id in ('avatars','seller-covers','product-images','review-images'));
create policy storage_avatar_owner_insert on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
create policy storage_seller_covers_owner_insert on storage.objects for insert with check (bucket_id = 'seller-covers' and exists (select 1 from public.seller_profiles sp where sp.id::text = (storage.foldername(name))[1] and sp.user_id = auth.uid()));
create policy storage_product_images_approved_seller_insert on storage.objects for insert with check (bucket_id = 'product-images' and exists (select 1 from public.seller_profiles sp where sp.id::text = (storage.foldername(name))[1] and sp.user_id = auth.uid() and sp.status = 'approved'));
create policy storage_review_images_owner_insert on storage.objects for insert with check (bucket_id = 'review-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy storage_seller_documents_owner on storage.objects for all using (bucket_id = 'seller-documents' and (public.is_admin() or exists (select 1 from public.seller_profiles sp where sp.id::text = (storage.foldername(name))[1] and sp.user_id = auth.uid()))) with check (bucket_id = 'seller-documents' and (public.is_admin() or exists (select 1 from public.seller_profiles sp where sp.id::text = (storage.foldername(name))[1] and sp.user_id = auth.uid())));
create policy storage_custom_order_files_owner on storage.objects for all using (bucket_id = 'custom-order-files' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text or exists (select 1 from public.custom_order_requests r join public.seller_profiles sp on sp.id = r.seller_id where r.id::text = (storage.foldername(name))[2] and sp.user_id = auth.uid()))) with check (bucket_id = 'custom-order-files' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text));

