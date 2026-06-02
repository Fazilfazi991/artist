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

const email = 'demo.buyer@example.com';
const password = 'DemoBuyer123!';

async function main() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  const existing = listed.users.find((user) => user.email === email);

  const result = existing
    ? await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true, user_metadata: { full_name: 'Demo Buyer', phone: '+971500000000' } })
    : await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: 'Demo Buyer', phone: '+971500000000' } });

  if (result.error) throw result.error;
  const user = result.data.user;
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    email,
    full_name: 'Demo Buyer',
    phone: '+971500000000',
    role: 'buyer'
  });
  if (profileError) throw profileError;

  console.log(`Demo buyer ready: ${email} / ${password}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
