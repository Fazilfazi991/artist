create unique index if not exists storefront_sections_seller_type_unique
  on public.storefront_sections(seller_id, section_type);

create index if not exists storefront_sections_seller_order_idx
  on public.storefront_sections(seller_id, display_order);

insert into public.storefront_sections (seller_id, section_type, title, content, display_order, is_visible)
select sp.id, seed.section_type, seed.title, seed.content::jsonb, seed.display_order, true
from public.seller_profiles sp
cross join (values
  ('process', 'Our Philosophy', '{"subtitle":"How each piece is thoughtfully made.","layout":"steps","limit":3}', 10),
  ('collections', 'Collections', '{"subtitle":"Curated groups from this storefront.","layout":"grid","limit":5}', 20),
  ('featured_products', 'Featured Pieces', '{"subtitle":"Handpicked work ready to explore.","layout":"grid","limit":8}', 30),
  ('custom_cta', 'Have something custom in mind?', '{"subtitle":"Share references, measurements, files, videos, and links. We will review and quote your piece.","layout":"band","buttonLabel":"Request Custom Order"}', 40),
  ('story', 'Meet the maker', '{"subtitle":"The process, place, and story behind the craft.","layout":"quote"}', 50),
  ('newsletter', 'Studio notes', '{"subtitle":"New work, studio notes, and collection launches.","layout":"footer"}', 60)
) as seed(section_type, title, content, display_order)
where sp.status = 'approved'
on conflict (seller_id, section_type) do nothing;
