# Artisan Marketplace App

Next.js 15 App Router marketplace for Indian artisans. The public design prototype remains separate; this backend sprint is scoped to Supabase, server helpers, validators, policies, and verification.

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3001
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never import it into client components or expose it in browser code.

## Local Development

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run verify:backend
```

Local URL: http://127.0.0.1:3001

## Supabase Setup

With Supabase CLI:

```bash
supabase init
supabase link --project-ref your_project_ref
supabase db push
```

Without Supabase CLI, create a Supabase project and run `supabase/schema.sql` in the SQL editor. The schema includes extensions, enums, tables, triggers, RLS policies, storage buckets, and demo seed data.

To regenerate database types later:

```bash
supabase gen types typescript --project-id your_project_ref --schema public > lib/types/database.types.ts
```

## Backend Foundation

Implemented backend pieces:

- Auth profile creation with buyer default role
- Seller application storage and admin approval workflow
- Product catalog schema with ready-to-ship, customized, and bespoke rules
- Cart, wishlist, address, order, commission, payout, custom-order, review, support, notification, homepage, and platform settings tables
- Storage buckets for avatars, seller covers, product images, custom-order files, seller documents, and review images
- Row-level security policies for buyer, seller, admin, and public access
- Server-side Supabase clients and auth guards
- Zod validators for auth, seller, product, order, custom order, address, and review data
- Demo database seed data for categories, approved artisans, products, and homepage sections
- Backend verification script at `scripts/verify-backend.ts`

## Manual Test Checklist

1. Register buyer.
2. Confirm profile auto-created.
3. Create seller application.
4. Submit seller application.
5. Verify buyer cannot self-approve.
6. Approve seller as admin.
7. Confirm profile role updated to seller.
8. Create product draft.
9. Publish approved seller product.
10. Confirm unapproved seller cannot publish.
11. Confirm public can read active products.
12. Confirm public cannot read private seller documents.
13. Confirm buyer cannot access another buyer address.
14. Confirm seller cannot access another seller product.
15. Confirm seller can see only assigned orders.
16. Confirm commission record calculation.
17. Confirm payout table access.
18. Confirm private custom-order file policy.

## Security Notes

- Admin assignment is manual/database-level only.
- Seller approval is enforced by RLS and a product publication trigger.
- Seller documents and custom-order files are private buckets.
- Public product reads require active products from approved sellers.
- Commission percentage is read from `platform_settings`, seeded as 8.

## Known Placeholders

- Payment gateway integration is intentionally not implemented.
- Courier integration is intentionally not implemented.
- Guest cart support is represented by schema but not fully wired.
- Seller dashboard UI is intentionally not part of this sprint.

## Next Backend Sprint Tasks

- Wire refined UI to live Supabase reads.
- Build seller onboarding forms against the server helpers.
- Add admin review screens.
- Add product media upload actions.
- Add checkout/order creation once payment design is finalized.
