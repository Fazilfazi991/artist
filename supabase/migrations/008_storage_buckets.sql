insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('seller-covers', 'seller-covers', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('product-images', 'product-images', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('custom-order-files', 'custom-order-files', false, 20971520, array['image/png','image/jpeg','image/webp','application/pdf']),
  ('seller-documents', 'seller-documents', false, 20971520, array['image/png','image/jpeg','image/webp','application/pdf']),
  ('review-images', 'review-images', true, 10485760, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
