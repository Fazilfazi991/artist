update auth.users
set email_change = ''
where email_change is null
  and email in (
    'demo.mira@example.com',
    'demo.arjun@example.com',
    'demo.naina@example.com',
    'demo.kabir@example.com',
    'neha.demo@artisanmarketplace.in'
  );
