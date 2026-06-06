create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role := case
    when new.raw_user_meta_data->>'account_type' = 'seller' then 'seller'::public.user_role
    else 'buyer'::public.user_role
  end;
  requested_store_name text := nullif(new.raw_user_meta_data->>'business_name', '');
  requested_store_slug text;
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    requested_role
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, public.profiles.email),
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    role = case
      when public.profiles.role = 'admin' then public.profiles.role
      when requested_role = 'seller' then 'seller'::public.user_role
      else public.profiles.role
    end,
    updated_at = now();

  if requested_role = 'seller' then
    requested_store_slug := trim(both '-' from regexp_replace(lower(coalesce(requested_store_name, new.raw_user_meta_data->>'full_name', 'seller')), '[^a-z0-9]+', '-', 'g'));

    insert into public.seller_profiles (
      user_id,
      store_name,
      store_slug,
      short_bio,
      shipping_regions,
      status
    )
    values (
      new.id,
      coalesce(requested_store_name, new.raw_user_meta_data->>'full_name', 'Seller Store'),
      coalesce(nullif(requested_store_slug, ''), 'seller') || '-' || left(new.id::text, 8),
      nullif(new.raw_user_meta_data->>'business_description', ''),
      jsonb_build_array(coalesce(nullif(new.raw_user_meta_data->>'country', ''), 'India')),
      'draft'
    )
    on conflict (user_id) do update set
      store_name = coalesce(excluded.store_name, public.seller_profiles.store_name),
      short_bio = coalesce(excluded.short_bio, public.seller_profiles.short_bio),
      shipping_regions = case
        when public.seller_profiles.shipping_regions = '[]'::jsonb then excluded.shipping_regions
        else public.seller_profiles.shipping_regions
      end,
      updated_at = now();
  end if;

  insert into public.wishlists (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

update public.profiles p
set role = 'seller',
    phone = coalesce(p.phone, nullif(u.raw_user_meta_data->>'phone', '')),
    full_name = coalesce(nullif(p.full_name, ''), nullif(u.raw_user_meta_data->>'full_name', ''), p.full_name),
    updated_at = now()
from auth.users u
where p.id = u.id
  and u.raw_user_meta_data->>'account_type' = 'seller'
  and p.role <> 'admin';

insert into public.seller_profiles (
  user_id,
  store_name,
  store_slug,
  short_bio,
  shipping_regions,
  status
)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'business_name', ''), nullif(u.raw_user_meta_data->>'full_name', ''), 'Seller Store'),
  coalesce(nullif(trim(both '-' from regexp_replace(lower(coalesce(nullif(u.raw_user_meta_data->>'business_name', ''), nullif(u.raw_user_meta_data->>'full_name', ''), 'seller')), '[^a-z0-9]+', '-', 'g')), ''), 'seller') || '-' || left(u.id::text, 8),
  nullif(u.raw_user_meta_data->>'business_description', ''),
  jsonb_build_array(coalesce(nullif(u.raw_user_meta_data->>'country', ''), 'India')),
  'draft'
from auth.users u
where u.raw_user_meta_data->>'account_type' = 'seller'
on conflict (user_id) do nothing;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
