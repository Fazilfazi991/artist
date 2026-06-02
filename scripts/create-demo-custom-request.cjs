const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: buyer, error: buyerError } = await supabase.from('profiles').select('id,email').eq('email', 'demo.buyer@example.com').single();
  if (buyerError) throw buyerError;
  const { data: seller, error: sellerError } = await supabase.from('seller_profiles').select('id,user_id,store_name,store_slug').eq('store_slug', 'mira-clay-studio').single();
  if (sellerError) throw sellerError;

  const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const { data: request, error } = await supabase.from('custom_order_requests').insert({
    buyer_id: buyer.id,
    seller_id: seller.id,
    title: `Demo custom gift set ${stamp}`,
    description: 'Please quote a small custom handmade gift set with warm colors, gift packaging, and a short note card. This request verifies the marketplace custom-order loop.',
    budget_min: 2500,
    budget_max: 6000,
    quantity: 3,
    delivery_location: 'Dubai test address',
    buyer_notes: 'Created by demo custom-order acceptance script.',
    reference_files: []
  }).select('*').single();
  if (error) throw error;

  await supabase.from('notifications').insert({
    user_id: seller.user_id,
    title: 'New custom-order request',
    message: `Demo Buyer sent ${request.request_number}.`,
    link: `/seller/custom-requests/${request.id}`
  });

  console.log(JSON.stringify({
    requestId: request.id,
    requestNumber: request.request_number,
    buyer: buyer.email,
    seller: seller.store_name,
    buyerUrl: `/account/custom-orders/${request.id}`,
    sellerUrl: `/seller/custom-requests/${request.id}`
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
