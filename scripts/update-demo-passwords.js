const fs = require('fs');
const path = require('path');
// Load env vars from .env.local
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
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updatePasswords() {
  const targetEmails = ['demo.mira@example.com', 'demo.arjun@example.com', 'demo.naina@example.com', 'demo.kabir@example.com'];
  const { data: { users } } = await supabase.auth.admin.listUsers();
  for (const user of users) {
    if (targetEmails.includes(user.email)) {
      const { error } = await supabase.auth.admin.updateUserById(user.id, { password: 'DemoSeller123!' });
      if (error) console.error('Failed to update', user.email, error);
      else console.log('Password updated for', user.email);
    }
  }
}

updatePasswords().then(() => {
  console.log('All done');
  process.exit(0);
}).catch(err => {
  console.error('Unexpected error', err);
  process.exit(1);
});
