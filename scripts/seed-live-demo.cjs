// @ts-nocheck
function loadLocalEnv() {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}
loadLocalEnv();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const categories = [
  ['Personalized Gifts','personalized-gifts','Handmade keepsakes made personal.',1],
  ['Home Decor','home-decor','Decor crafted by Indian artisans.',2],
  ['Jewellery','jewellery','Small-batch jewellery and adornments.',3],
  ['Scrapbooks','scrapbooks','Albums, journals, and memory books.',4],
  ['Candles','candles','Poured candles and fragrance rituals.',5],
  ['Art and Prints','art-and-prints','Original art, prints, and illustrated goods.',6]
].map(([name, slug, description, display_order]) => ({ name, slug, description, image_url: '/artisan-hero.png', display_order, is_active: true }));

const sellers = [
  { email: 'demo.mira@example.com', name: 'Mira Kapoor', store_name: 'Mira Clay Studio', store_slug: 'mira-clay-studio', short_bio: 'Ceramic home objects from Jaipur.', full_story: 'Mira works with stoneware forms inspired by desert architecture and old blue pottery palettes.', category: 'home-decor', years_experience: 9, city: 'Jaipur', state: 'Rajasthan', days: 7 },
  { email: 'demo.arjun@example.com', name: 'Arjun Mehta', store_name: 'Arjun Paper Co', store_slug: 'arjun-paper-co', short_bio: 'Scrapbooks and paper goods from Pune.', full_story: 'Arjun builds layered paper keepsakes for weddings, milestones, and family archives.', category: 'scrapbooks', years_experience: 6, city: 'Pune', state: 'Maharashtra', days: 5 },
  { email: 'demo.naina@example.com', name: 'Naina Rao', store_name: 'Naina Silver Lines', store_slug: 'naina-silver-lines', short_bio: 'Contemporary jewellery from Bengaluru.', full_story: 'Naina mixes silver, enamel, and textile details for everyday pieces with a craft-first finish.', category: 'jewellery', years_experience: 11, city: 'Bengaluru', state: 'Karnataka', days: 10 },
  { email: 'demo.kabir@example.com', name: 'Kabir Ansari', store_name: 'Kabir Wick Works', store_slug: 'kabir-wick-works', short_bio: 'Botanical candles from Lucknow.', full_story: 'Kabir pours small batches with soy wax, attars, and reusable vessels made with local partners.', category: 'candles', years_experience: 5, city: 'Lucknow', state: 'Uttar Pradesh', days: 4 }
];

const productSeeds = [
  ['mira-clay-studio','home-decor','Hand-thrown Breakfast Bowl','hand-thrown-breakfast-bowl','Stoneware bowl with hand-painted rim.','Ready-to-ship ceramic bowl made in small batches.','ready_to_ship','active',1450,12,3,null,120,true,false,'Stoneware clay, glaze','Hand wash recommended'],
  ['mira-clay-studio','home-decor','Custom Name Tile','custom-name-tile','Personalized ceramic door tile.','Made-to-order tile with chosen name and palette.','customized','active',2200,null,null,9,150,false,true,'Ceramic, glaze','Wipe clean'],
  ['mira-clay-studio','home-decor','Bespoke Tableware Set','bespoke-tableware-set','Commission a tableware set.','Quote-based bespoke set for dinner tables and gifting.','bespoke','active',null,null,null,30,0,false,true,'Stoneware','Care guide included'],
  ['arjun-paper-co','scrapbooks','Wedding Memory Scrapbook','wedding-memory-scrapbook','Layered handmade wedding album.','A customized scrapbook with pockets, tags, and illustrated dividers.','customized','active',3800,null,null,12,180,true,true,'Paper, board, fabric','Keep dry'],
  ['arjun-paper-co','personalized-gifts','Mini Gift Explosion Box','mini-gift-explosion-box','Compact personalized gift box.','Ready base design with custom messages and photos.','customized','active',1250,null,null,6,90,false,true,'Cardstock, ribbon','Keep dry'],
  ['arjun-paper-co','scrapbooks','Travel Journal Kit','travel-journal-kit','Ready-to-ship journaling kit.','Hand-bound journal with stickers and pockets.','ready_to_ship','active',990,20,2,null,80,false,false,'Paper, thread','Keep dry'],
  ['naina-silver-lines','jewellery','Silver Lotus Studs','silver-lotus-studs','Minimal silver studs.','Everyday lotus-inspired studs in sterling silver.','ready_to_ship','active',1850,15,2,null,100,true,false,'Sterling silver','Store dry'],
  ['naina-silver-lines','jewellery','Custom Birthstone Pendant','custom-birthstone-pendant','Pendant with selected birthstone.','Made-to-order pendant with silver chain.','customized','active',3200,null,null,14,120,false,true,'Sterling silver, gemstone','Avoid perfume'],
  ['kabir-wick-works','candles','Rose Attar Soy Candle','rose-attar-soy-candle','Floral soy candle in reusable tin.','Hand-poured candle with rose attar notes.','ready_to_ship','active',850,30,2,null,70,true,false,'Soy wax, cotton wick','Burn within sight'],
  ['kabir-wick-works','personalized-gifts','Corporate Gift Candle Hamper','corporate-gift-candle-hamper','Quote-based bulk gifting hamper.','Bespoke candle hamper for teams and events.','bespoke','active',null,null,null,20,0,false,true,'Soy wax, packaging','Care guide included']
];

function assertNoError(label, error) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

async function getOrCreateUser(seller) {
  const { data: created, error } = await supabase.auth.admin.createUser({ email: seller.email, password: 'DemoSeller123!', email_confirm: true, user_metadata: { full_name: seller.name } });
  if (!error && created?.user) return created.user;
  console.error('create user failed', seller.email, error?.message);
  const { data: list, error: listError } = await supabase.auth.admin.listUsers();
  assertNoError('list users', listError);
  const existing = list.users.find((user) => user.email === seller.email);
  if (!existing) throw error;
  return existing;
}

async function main() {
  let result = await supabase.from('platform_settings').upsert([
    { key: 'marketplace_commission_percentage', value: 8 },
    { key: 'marketplace_name', value: 'Artisan Marketplace' },
    { key: 'currency', value: 'INR' }
  ], { onConflict: 'key' });
  assertNoError('settings', result.error);

  result = await supabase.from('categories').upsert(categories, { onConflict: 'slug' }).select('*');
  assertNoError('categories', result.error);
  const categoryBySlug = Object.fromEntries(result.data.map((category) => [category.slug, category]));

  const sellerBySlug = {};
  for (const seller of sellers) {
    const user = await getOrCreateUser(seller);
    result = await supabase.from('profiles').upsert({ id: user.id, email: seller.email, full_name: seller.name, role: 'seller' }, { onConflict: 'id' });
    assertNoError(`profile ${seller.email}`, result.error);
    result = await supabase.from('seller_profiles').upsert({
      user_id: user.id,
      store_name: seller.store_name,
      store_slug: seller.store_slug,
      short_bio: seller.short_bio,
      full_story: seller.full_story,
      profile_image_url: '/artisan-hero.png',
      cover_image_url: '/artisan-hero.png',
      primary_category_id: categoryBySlug[seller.category]?.id,
      years_experience: seller.years_experience,
      city: seller.city,
      state: seller.state,
      average_production_days: seller.days,
      shipping_regions: ['India'],
      supports_ready_to_ship: true,
      supports_customized: true,
      supports_bespoke: true,
      status: 'approved',
      reviewed_at: new Date().toISOString()
    }, { onConflict: 'store_slug' }).select('*').single();
    assertNoError(`seller ${seller.store_slug}`, result.error);
    sellerBySlug[seller.store_slug] = result.data;
  }

  for (const seed of productSeeds) {
    const [sellerSlug, categorySlug, name, slug, short_description, description, product_type, status, base_price, stock_quantity, dispatch_days, production_days, shipping_fee, is_featured, is_customizable, materials, care_instructions] = seed;
    result = await supabase.from('products').upsert({ seller_id: sellerBySlug[sellerSlug].id, category_id: categoryBySlug[categorySlug].id, name, slug, short_description, description, product_type, status, base_price, stock_quantity, dispatch_days, production_days, shipping_fee, is_featured, is_customizable, materials, care_instructions }, { onConflict: 'slug' }).select('*').single();
    assertNoError(`product ${slug}`, result.error);
    const product = result.data;
    result = await supabase.from('product_images').upsert({ product_id: product.id, image_url: '/artisan-hero.png', alt_text: name, display_order: 1, is_primary: true }, { onConflict: 'product_id,display_order' });
    if (result.error && !String(result.error.message).includes('constraint')) console.warn(`image skipped for ${slug}: ${result.error.message}`);
  }

  console.log('Seeded live marketplace demo data');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
