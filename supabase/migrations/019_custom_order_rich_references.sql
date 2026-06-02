alter table public.custom_order_requests
  add column if not exists reference_links jsonb not null default '[]'::jsonb;

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ]
where id in ('custom-order-files', 'custom-order-milestone-files');
