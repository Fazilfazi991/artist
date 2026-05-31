# Supabase Backend Foundation

Apply the migrations in order with Supabase CLI or paste `supabase/schema.sql` into the SQL editor for a new project.

## Migration Order

1. `001_extensions_and_enums.sql`
2. `002_profiles_and_sellers.sql`
3. `003_categories_and_products.sql`
4. `004_cart_wishlist_and_addresses.sql`
5. `005_orders_and_commissions.sql`
6. `006_custom_orders.sql`
7. `007_reviews_support_notifications.sql`
8. `008_storage_buckets.sql`
9. `009_rls_policies.sql`
10. `010_seed_demo_data.sql`

## Storage Folder Conventions

- `avatars/{userId}/...`
- `seller-covers/{sellerId}/...`
- `product-images/{sellerId}/{productId}/...`
- `custom-order-files/{buyerId}/{requestId}/...`
- `seller-documents/{sellerId}/...`
- `review-images/{buyerId}/{reviewId}/...`

Admin users must be assigned manually at the database level. Do not expose public admin promotion flows.
