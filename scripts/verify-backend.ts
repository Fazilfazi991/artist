// @ts-nocheck
const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const serviceEnv = 'SUPABASE_SERVICE_ROLE_KEY';
const coreTables = ['profiles','seller_profiles','seller_documents','categories','products','product_images','product_variants','product_customization_fields','wishlists','wishlist_items','carts','cart_items','addresses','orders','order_items','order_status_history','commission_records','seller_payouts','custom_order_requests','custom_order_quotes','custom_order_milestones','reviews','support_tickets','notifications','platform_settings','homepage_sections'];
const buckets = ['avatars','seller-covers','product-images','custom-order-files','seller-documents','review-images'];

async function main() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = (process.env[serviceEnv] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  console.log('Backend verification');
  console.log(`Using ${process.env[serviceEnv] ? 'service role' : 'anon'} key`);

  const tableResults = [];
  for (const table of coreTables) {
    const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    tableResults.push({ table, ok: !error, error: error?.message });
  }

  const failedTables = tableResults.filter((result) => !result.ok);
  if (failedTables.length) {
    console.error('Table checks failed:');
    failedTables.forEach((result) => console.error(`- ${result.table}: ${result.error}`));
    process.exitCode = 1;
  } else {
    console.log(`Core tables exist: ${coreTables.length}/${coreTables.length}`);
  }

  const { data: commission, error: commissionError } = await supabase.from('platform_settings').select('value').eq('key', 'marketplace_commission_percentage').single();
  const commissionValue = Number(commission?.value);
  if (commissionError || commissionValue !== 8) {
    console.error(`Commission setting check failed: ${commissionError?.message || commissionValue}`);
    process.exitCode = 1;
  } else {
    console.log('Commission setting is 8%');
  }

  const checks = [
    ['Categories', supabase.from('categories').select('id', { count: 'exact', head: true })],
    ['Demo sellers', supabase.from('seller_profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved')],
    ['Demo products', supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active')],
    ['Public products query', supabase.from('products').select('id,name,slug').eq('status', 'active').limit(1)]
  ];

  for (const [label, promise] of checks) {
    const { count, data, error } = await promise;
    if (error) {
      console.error(`${label} check failed: ${error.message}`);
      process.exitCode = 1;
    } else {
      console.log(`${label}: ${count ?? data?.length ?? 0}`);
    }
  }

  console.log(`Storage buckets documented/configured by migration: ${buckets.join(', ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

