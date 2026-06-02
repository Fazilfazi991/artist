# Stitch Prompt: Full UI Redesign For Artisan Marketplace

Design a complete new UI system and screen set for a production-ready artisan marketplace web app. This is not a landing page-only project. The product already has public shopping, artisan storefronts, buyer accounts, seller dashboards, admin operations, checkout, and custom-order workflows. Redesign the whole website while preserving every route, section, state, and workflow listed below.

## Product Context

The product is an online marketplace for handmade artisan goods, focused on independent Indian artisans and buyers who want ready-made, customizable, or fully bespoke handmade products. The platform must feel premium, trustworthy, warm, editorial, and operationally usable. It should not feel like a generic SaaS template, a beige craft blog, or a loud ecommerce clone.

Core audiences:

- Buyers browsing handmade products, artisan storefronts, categories, carts, checkout, orders, custom orders, support, wishlist, notifications, and profile settings.
- Sellers/artisans managing their storefront, products, collections, orders, custom requests, quotes, milestones, analytics, reviews, messages, payouts, and settings.
- Admin users reviewing sellers, products, orders, and custom orders.

Important product qualities:

- Handmade, human, premium, trust-first.
- Image-rich marketplace experience.
- Clear ecommerce conversion flows.
- Dense but readable seller/admin workspaces.
- Custom-order workflow must be treated as a major feature, not a secondary form.
- Mobile must be first-class for buyers; desktop must be first-class for sellers and admins.

## Current Tech And Implementation Constraints

- Next.js app with Tailwind CSS.
- Uses `lucide-react` icons.
- Existing routes and workflow logic should stay intact.
- Design should be easy to implement in React/Tailwind components.
- Use consistent component primitives: header, footer, sidebar nav, tabs, forms, product cards, seller cards, order cards, status badges, timelines, quote panels, dashboards, empty states, tables/lists, filters, modals/drawers, toasts/alerts.
- Avoid fragile decorative layouts that would be hard to implement responsively.
- Cards can be used for repeated items, modals, tools, and dashboards, but avoid putting cards inside cards.
- Buttons should have clear hierarchy: primary, secondary, quiet/ghost, destructive.
- Icons should support scannability but not replace critical text labels in important workflows.
- All designs must include desktop and mobile responsive behavior.

## Visual Direction

Create a fresh visual identity. Do not simply polish the existing warm beige/rust UI.

Desired feel:

- Premium handmade marketplace.
- Warm but modern.
- Editorial product discovery for public pages.
- Calm, efficient, structured dashboards for sellers/admins.
- Strong use of real product/artisan imagery.
- Soft, tactile details are welcome, but avoid clutter.

Avoid:

- Generic marketplace blue/gray SaaS.
- Overused purple gradients.
- All-beige, all-brown, all-orange palettes.
- Decorative gradient blobs/orbs.
- Oversized marketing sections in operational areas.
- Tiny unreadable dashboard text.
- UI that only works for perfect demo content.

Include in the design system:

- Color palette with primary, secondary, accent, surface, text, muted text, success, warning, error, border, focus ring.
- Typography scale for public pages, dashboards, forms, tables, and dense cards.
- Spacing scale.
- Border radius system.
- Shadows/elevation rules.
- Icon usage rules.
- Status badge styles for ecommerce and custom-order statuses.
- Form field styles: input, textarea, select, checkbox, radio, file upload/dropzone, URL list input, validation errors, helper text.
- Data display styles: tables, responsive lists, metric cards, timelines, activity feeds.
- Empty states, loading/skeleton states, error states, success states.
- Mobile navigation drawer and sticky bottom/action behavior where useful.

## Global Website Chrome

Design global buyer-facing chrome:

- Announcement bar.
- Header with logo, primary nav, search, wishlist, account, cart count, seller CTA.
- Desktop navigation: Shop, Categories, Storefronts, Custom Orders, Our Story.
- Mobile header with menu button, logo, search, account/cart access.
- Mobile navigation drawer with primary links and Become a Seller CTA.
- Footer with brand summary, shop links, artisan links, help links, seller links when relevant, newsletter signup, copyright.
- Logged-out and logged-in header states.
- Cart count state.
- Search focus state.

## Public Buyer Pages

### Home `/`

Design the full home page:

- First viewport hero for Artisan Marketplace with strong handmade imagery.
- Clear CTAs: Shop Now, Explore Storefronts.
- Trust strip: handmade, authentic, supporting artisans, secure payments.
- Shop by Category section.
- Handpicked/featured products section.
- Mission/story section about empowering artisans and preserving traditions.
- Stats band: artisans empowered, happy customers, products sold, states covered.
- Featured storefronts / makers section.
- Service reassurance strip: returns, cash on delivery, secure payments, worldwide shipping.
- Footer.

The hero should show the product/marketplace clearly, not abstract decoration.

### Shop `/shop`

Design product browsing:

- Breadcrumb.
- Page heading and supporting copy.
- Search/filter/sort controls.
- Desktop filter sidebar.
- Mobile filter drawer.
- Product grid.
- Empty state for no products.
- Product cards with image, product type, customizable/bespoke badge, title, artisan, price, rating, wishlist.
- Product types: Ready to Ship, Customizable, Made to Order/Bespoke.

Filters to support:

- Category.
- Price range.
- Product type.
- Occasion.
- Artisan.
- Search query.

### Category Detail `/category/[slug]`

Design category landing/product listing:

- Category hero/header.
- Category description.
- Product grid.
- Empty state.
- Breadcrumb back to shop.

### Product Detail `/product/[slug]` And `/artisan/[storeSlug]/product/[productSlug]`

Design product detail:

- Breadcrumb.
- Image gallery with thumbnails.
- Product type badge.
- Title, artisan link, rating/review count, timeline, price.
- Description.
- Quantity selector for ready/customizable products.
- Customization note field for customizable products.
- Bespoke project requirement prompt for made-to-order products.
- CTAs: Add to Cart, Buy Now, Request Custom Quote, Wishlist.
- Trust row: dispatch tracking, secure checkout, verified artisan.
- Link to request custom order from the artisan.
- Mobile sticky purchase/action bar.

### Storefront Directory `/storefronts` And `/artisans`

Design artisan discovery:

- Editorial header: Discover independent makers and their stories.
- Search/filter area for artisan storefronts.
- Cards for storefronts with cover image, logo/avatar, store name, location, category, bio, rating/reviews, custom-order availability, visit CTA.
- Empty state.
- Optional featured storefront treatment.

### Artisan Storefront `/artisan/[storeSlug]`

Design public storefront pages that can support multiple seller templates:

- Storefront-specific header/nav separate from global buyer header where needed.
- Cover image, avatar/logo, store name, verified badge, location, category, short bio.
- Storefront navigation: Home, Products, Collections, About, Custom Order.
- Hero section with seller story and CTA.
- Featured products.
- Collections.
- About/story preview.
- Newsletter/signup section.
- Footer customized to seller.
- Actions: message/share, visit products, request custom order.

Storefront templates to support visually:

- Warm Editorial.
- Clean Grid.
- Personalized Gifts.
- Visual Portfolio.
- Boutique Brand.

### Artisan Products `/artisan/[storeSlug]/products`

Design:

- Store-specific product listing.
- Storefront nav/breadcrumb.
- Product grid using the same marketplace card language but with seller branding.

### Artisan Collections `/artisan/[storeSlug]/collections` And `/artisan/[storeSlug]/collections/[collectionSlug]`

Design:

- Collection listing cards.
- Collection detail header.
- Product grid for collection products.
- Empty state.

### Artisan About `/artisan/[storeSlug]/about`

Design:

- Seller story, founder bio, craft/process, location, values.
- Imagery blocks.
- Trust stats/reviews.
- CTA to shop or request custom order.

### Custom Order Info `/custom-orders`

Design public education page:

- Header: Bespoke handmade work starts with a quote.
- CTA: Choose a Storefront.
- Flow cards: submit brief, receive quote, approve and track milestones.
- How it works explanation.
- Highlight supported use cases: wedding decor, corporate gifting, bulk handmade products, installations, custom art, event projects.

### Artisan Custom Order Form `/artisan/[storeSlug]/custom-order`

This is a critical workflow. Design a polished request form for buyers:

- Context header for the selected artisan.
- Optional selected product context if launched from a product page.
- Form fields:
  - Title/project name.
  - Description/project brief.
  - Buyer notes.
  - Budget minimum and maximum.
  - Quantity.
  - Deadline.
  - Delivery location.
  - Reference files upload.
  - Reference links input/list.
- Reference files must support images, PDFs, and videos.
- Reference links must support URLs to Pinterest, Instagram, YouTube, Google Drive, product examples, moodboards, etc.
- Include helper copy explaining what references are useful.
- Show uploaded/reference item preview states:
  - Image thumbnail.
  - Video/file icon and filename.
  - PDF/file item.
  - URL chip/card with remove action.
- Include validation/error states.
- Submit success state should lead to buyer custom-order detail.
- Login-required state should redirect cleanly.

### About `/about`

Design:

- Brand story.
- Mission.
- Artisan empowerment.
- Trust and quality.
- Marketplace values.
- CTA to shop and become a seller.

### How It Works `/how-it-works`

Design:

- Buyer journey.
- Seller journey.
- Custom-order journey.
- Shipping/payment/returns explanation.
- FAQ-style sections.

### Become A Seller `/become-a-seller`

Design:

- Seller value proposition.
- Benefits.
- Process steps.
- CTA to register/apply.
- Trust/support details.

### Contact `/contact`

Design:

- Contact/support options.
- Form or contact cards.
- Links to account support and seller help.

### Auth Pages `/login`, `/register`, `/auth/callback`

Design:

- Login form with email/password.
- Register form.
- Redirect/next destination awareness.
- Error state.
- Loading/submitting state.
- Password visibility option.
- Links between login/register.
- Marketplace brand panel or image area.
- Mobile compact layout.

## Cart And Checkout

### Cart `/cart`

Design:

- Cart item list grouped by seller if useful.
- Product thumbnail, title, seller, variant/customization notes, quantity, price, remove.
- Empty cart state.
- Order summary.
- CTA to checkout.
- Continue shopping link.

### Checkout `/checkout`, `/checkout/address`, `/checkout/review`, `/checkout/confirmation`

Design multi-step checkout:

- Progress indicator: Cart/Address/Review/Confirmation.
- Address selection/add form.
- Review order by seller.
- Price summary: subtotal, shipping, total.
- Payment placeholder/manual states if present.
- Confirmation success page with order numbers and next steps.
- Error states and validation.
- Mobile sticky total/CTA.

## Buyer Account

All buyer account pages use a shared account shell. Design:

- Account page header.
- Sidebar/tab navigation.
- Mobile horizontal nav or drawer.
- Logout.
- Consistent content area.

Account nav items:

- Overview.
- Orders.
- Custom Orders.
- Storefronts.
- Addresses.
- Wishlist.
- Notifications.
- Support.
- Profile.

### Account Overview `/account`

Design:

- Welcome header.
- Metric cards: total orders, active orders, awaiting delivery, wishlist items.
- Recent orders list.
- Delivery address summary.
- Wishlist preview.
- Support CTA.
- Empty states.

### Buyer Orders `/account/orders` And `/account/orders/[id]`

Design:

- Orders list with status, seller, date, item count, total, next action.
- Order detail with:
  - Items.
  - Status badge.
  - Fulfillment timeline.
  - Delivery address.
  - Tracking details.
  - Price summary.
  - Confirm delivery button where relevant.
  - Issue/support form.
- Empty state.

### Buyer Custom Orders `/account/custom-orders` And `/account/custom-orders/[id]`

Design:

- Custom-order list with request number, status, seller, date, title, latest quote amount, next action.
- Detail page with:
  - Status badges.
  - Project description.
  - Buyer notes.
  - Budget, quantity, deadline, delivery location.
  - Reference files and reference links.
  - Artisan info.
  - Quote panel.
  - Accept quote / request revision actions.
  - Milestones list.
  - Timeline/history.
  - Payment status.
  - Empty/no quote state.
- Make statuses visually clear:
  - Request submitted.
  - Artisan reviewing.
  - Quote sent.
  - Revision requested.
  - Quote accepted.
  - Deposit pending/paid.
  - In production.
  - Milestone update.
  - Final payment pending/paid.
  - Ready for delivery.
  - Completed.
  - Cancelled.

### Addresses `/account/addresses`

Design:

- Address list.
- Add/edit address form.
- Default address badge.
- Actions: edit, make default, delete.
- Empty state.

### Wishlist `/account/wishlist`

Design:

- Saved product grid/list.
- Empty state.
- Wishlist item action to view product/remove.

### Notifications `/account/notifications`

Design:

- Notification list.
- Read/unread states.
- Open link.
- Mark read.
- Empty state.

### Support `/account/support`

Design:

- Ticket list.
- Create support ticket form.
- Optional related order selector.
- Subject and description.
- Empty state.

### Profile `/account/profile`

Design:

- Profile avatar/initial.
- Full name, email, phone.
- Read-only email state.
- Save success/error.

### Followed/Viewed Storefronts `/account/storefronts`

Design:

- Buyer storefronts area for saved/followed/recent artisan stores.
- Empty state.

## Seller Workspace

Seller workspace is a dashboard product. It should feel quieter, denser, and more operational than public pages.

Shared seller shell:

- Desktop left sidebar.
- Mobile top header with horizontal nav/drawer.
- Store identity block.
- View Storefront link.
- Notifications button.
- Logout.
- Sidebar groups:
  - Main: Overview, Orders, Products, Collections.
  - Store: Storefront, Custom Orders.
  - Insights: Analytics, Reviews.
  - Account: Messages, Payouts, Settings.

### Seller Onboarding `/seller/onboarding`

Design:

- Multi-step seller setup/application.
- Store name, slug, bio, location, category, branding basics.
- Progress indicator.
- Save/continue states.
- Validation.

### Seller Dashboard `/seller/dashboard`

Design:

- Overview metrics.
- Recent orders.
- Recent custom requests.
- Product/storefront health.
- Quick actions: add product, manage storefront, view requests.
- Alerts/notifications.

### Seller Orders `/seller/orders` And `/seller/orders/[id]`

Design:

- Orders list with filters/status.
- Order detail:
  - Buyer info.
  - Items.
  - Fulfillment status.
  - Tracking fields/actions.
  - Status timeline.
  - Price summary.
  - Notes/issues.

### Seller Products `/seller/products`, `/seller/products/new`, `/seller/products/[id]/edit`, `/seller/products/[id]/preview`

Design:

- Product list/table/grid hybrid.
- Product status, type, price, inventory, image, actions.
- Create/edit product form:
  - Name/title.
  - Description.
  - Short description.
  - Category.
  - Product type: ready/customized/bespoke.
  - Price/quote required.
  - Inventory.
  - Images.
  - Customization options.
  - Shipping/timeline.
  - Publish/draft.
- Preview page showing buyer-facing product layout.
- Empty state.

### Seller Collections `/seller/collections`, `/seller/collections/new`, `/seller/collections/[id]/edit`

Design:

- Collection list.
  - Name, image, product count, visibility.
- Collection form:
  - Title.
  - Description.
  - Cover image.
  - Products selection.
  - Publish/draft.

### Seller Storefront `/seller/storefront`

Design:

- Storefront management hub.
- Storefront completion checklist.
- Current template preview.
- Links to branding, content, policies, template, preview.
- CTA to view public storefront.

### Storefront Branding `/seller/storefront/branding`

Design:

- Logo/avatar upload.
- Cover image upload.
- Color/theme settings.
- Typography/template style where relevant.
- Preview panel.

### Storefront Content `/seller/storefront/content`

Design:

- Store bio.
- Short bio.
- Founder story.
- Process/craft details.
- Location/category.
- Featured messaging.

### Storefront Policies `/seller/storefront/policies`

Design:

- Shipping policy.
- Return policy.
- Custom-order policy.
- Processing time.
- FAQ/policy sections.

### Storefront Template `/seller/storefront/template`

Design:

- Template selection cards:
  - Warm Editorial.
  - Clean Grid.
  - Personalized Gifts.
  - Visual Portfolio.
  - Boutique Brand.
- Preview thumbnails.
- Apply/save state.

### Storefront Preview `/seller/storefront/preview`

Design:

- Full public storefront preview.
- Device preview controls if useful.
- Back to editor action.

### Seller Custom Requests `/seller/custom-requests` And `/seller/custom-requests/[id]`

This is one of the most important seller workflows.

Design list page:

- Request cards/table with request number, buyer, project title, status, deadline, budget, latest quote state, updated date.
- Filters by status.
- Search.
- Empty state.

Design detail page:

- Header with request number, title, status, all requests link.
- Buyer info.
- Project description.
- Buyer notes.
- Budget range, quantity, deadline, delivery location.
- Reference files and reference links panel.
- Quote history.
- Quote form:
  - Quote amount.
  - Timeline.
  - Message/terms.
  - Send quote / send revision.
- Seller actions:
  - Start review.
  - Decline/cancel where relevant.
  - Mark in production.
  - Mark ready for delivery.
- Milestone form:
  - Milestone title.
  - Description.
  - Progress/status.
  - Attachment upload, including image/video/PDF.
- Milestone list.
- Timeline/status history.
- Payment/deposit/final payment indicators.
- Error/success states.

### Seller Analytics `/seller/analytics`

Design:

- Revenue, orders, views, conversion, custom requests.
- Time range controls.
- Charts.
- Top products.
- Top storefront metrics.
- Empty/no data state.

### Seller Reviews `/seller/reviews`

Design:

- Rating summary.
- Review list.
- Product/store association.
- Reply action if supported.
- Empty state.

### Seller Messages `/seller/messages`

Design:

- Conversation list.
- Conversation detail/placeholder.
- Message composer.
- Empty state.

### Seller Payouts `/seller/payouts`

Design:

- Balance summary.
- Payout history.
- Payment method/payout account state.
- Pending/paid/failed badges.
- Empty state.

### Seller Settings `/seller/settings`

Design:

- Store/account settings.
- Business profile.
- Contact info.
- Notification preferences.
- Password/security placeholder if relevant.
- Danger zone if needed.
- Save success/error.

## Admin

Admin pages should be dense, direct, and clearly separated from seller pages.

### Admin Dashboard `/admin/dashboard`

Design:

- Platform metrics.
- Pending seller approvals.
- Product moderation summary.
- Order/custom-order operations.
- Recent activity.

### Admin Sellers `/admin/sellers` And `/admin/sellers/[id]`

Design:

- Seller list with approval/status filters.
- Seller detail:
  - Profile/store info.
  - Application details.
  - Products/orders summary.
  - Approve/reject/suspend actions.

### Admin Products `/admin/products` And `/admin/products/[id]`

Design:

- Product moderation list.
- Product detail review.
- Approve/reject/unpublish actions.
- Image/content review.

### Admin Orders `/admin/orders` And `/admin/orders/[id]`

Design:

- Order operations list.
- Detail with buyer, seller, items, tracking, status, payment summary.
- Admin status controls.

### Admin Custom Orders `/admin/custom-orders` And `/admin/custom-orders/[id]`

Design:

- Custom-order operations list.
- Detail with buyer, seller, quote, milestone, payment status.
- Manual payment state controls.
- Admin intervention/status controls.

## Not Found And System States

Design:

- `404` / route unavailable page.
- Runtime-friendly generic error page style if needed.
- Loading skeletons for grids, dashboards, tables, and details.
- Permission/auth-required states.
- Empty states for every list.
- Validation errors.
- Success banners.
- Warning banners.

## Required Output From Stitch

Please return:

1. A complete visual direction with palette, typography, spacing, component styling, and examples.
2. Desktop and mobile designs for the core buyer pages:
   - Home.
   - Shop.
   - Product detail.
   - Storefront directory.
   - Artisan storefront.
   - Custom-order form.
   - Cart.
   - Checkout.
   - Buyer account overview.
   - Buyer custom-order detail.
3. Desktop and mobile designs for seller workspace:
   - Seller shell/navigation.
   - Dashboard.
   - Products list/form.
   - Orders list/detail.
   - Custom request detail.
   - Storefront editor.
   - Settings.
4. Admin design direction:
   - Dashboard.
   - Data list pages.
   - Detail/moderation pages.
5. Component library examples:
   - Header/footer.
   - Sidebars.
   - Product cards.
   - Storefront cards.
   - Order cards.
   - Status badges.
   - Forms.
   - File/link reference upload component.
   - Tables/lists.
   - Timelines.
   - Metric cards.
   - Empty/loading/error/success states.
6. Implementation notes that a React/Tailwind developer can use directly.

Do not skip any major route group. If a page is too similar to another page, provide a shared template and explain how it adapts.

## Route Checklist To Cover

- `/`
- `/shop`
- `/category/[slug]`
- `/product/[slug]`
- `/storefronts`
- `/artisans`
- `/artisan/[storeSlug]`
- `/artisan/[storeSlug]/products`
- `/artisan/[storeSlug]/product/[productSlug]`
- `/artisan/[storeSlug]/collections`
- `/artisan/[storeSlug]/collections/[collectionSlug]`
- `/artisan/[storeSlug]/about`
- `/artisan/[storeSlug]/custom-order`
- `/custom-orders`
- `/about`
- `/how-it-works`
- `/become-a-seller`
- `/contact`
- `/login`
- `/register`
- `/cart`
- `/checkout`
- `/checkout/address`
- `/checkout/review`
- `/checkout/confirmation`
- `/account`
- `/account/orders`
- `/account/orders/[id]`
- `/account/custom-orders`
- `/account/custom-orders/[id]`
- `/account/storefronts`
- `/account/addresses`
- `/account/wishlist`
- `/account/notifications`
- `/account/support`
- `/account/profile`
- `/seller/onboarding`
- `/seller/dashboard`
- `/seller/orders`
- `/seller/orders/[id]`
- `/seller/products`
- `/seller/products/new`
- `/seller/products/[id]/edit`
- `/seller/products/[id]/preview`
- `/seller/collections`
- `/seller/collections/new`
- `/seller/collections/[id]/edit`
- `/seller/storefront`
- `/seller/storefront/branding`
- `/seller/storefront/content`
- `/seller/storefront/policies`
- `/seller/storefront/template`
- `/seller/storefront/preview`
- `/seller/custom-requests`
- `/seller/custom-requests/[id]`
- `/seller/analytics`
- `/seller/reviews`
- `/seller/messages`
- `/seller/payouts`
- `/seller/settings`
- `/admin/dashboard`
- `/admin/sellers`
- `/admin/sellers/[id]`
- `/admin/products`
- `/admin/products/[id]`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/custom-orders`
- `/admin/custom-orders/[id]`
- `/not-found`
