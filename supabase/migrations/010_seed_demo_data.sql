insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo.mira@example.com','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Mira Kapoor"}'::jsonb,now(),now()),
  ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo.arjun@example.com','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Arjun Mehta"}'::jsonb,now(),now()),
  ('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo.naina@example.com','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Naina Rao"}'::jsonb,now(),now()),
  ('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo.kabir@example.com','',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Kabir Ansari"}'::jsonb,now(),now())
on conflict (id) do nothing;
insert into public.platform_settings (key, value) values
  ('marketplace_commission_percentage', '8'::jsonb),
  ('marketplace_name', '"Artisan Marketplace"'::jsonb),
  ('currency', '"INR"'::jsonb)
on conflict (key) do update set value = excluded.value;

insert into public.categories (id, name, slug, description, image_url, display_order) values
  ('10000000-0000-0000-0000-000000000001','Personalized Gifts','personalized-gifts','Handmade keepsakes made personal.','/seed/categories/personalized-gifts.jpg',1),
  ('10000000-0000-0000-0000-000000000002','Home Decor','home-decor','Decor crafted by Indian artisans.','/seed/categories/home-decor.jpg',2),
  ('10000000-0000-0000-0000-000000000003','Jewellery','jewellery','Small-batch jewellery and adornments.','/seed/categories/jewellery.jpg',3),
  ('10000000-0000-0000-0000-000000000004','Scrapbooks','scrapbooks','Albums, journals, and memory books.','/seed/categories/scrapbooks.jpg',4),
  ('10000000-0000-0000-0000-000000000005','Candles','candles','Poured candles and fragrance rituals.','/seed/categories/candles.jpg',5),
  ('10000000-0000-0000-0000-000000000006','Art and Prints','art-and-prints','Original art, prints, and illustrated goods.','/seed/categories/art-and-prints.jpg',6)
on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url;

insert into public.profiles (id, email, full_name, role) values
  ('20000000-0000-0000-0000-000000000001','demo.mira@example.com','Mira Kapoor','seller'),
  ('20000000-0000-0000-0000-000000000002','demo.arjun@example.com','Arjun Mehta','seller'),
  ('20000000-0000-0000-0000-000000000003','demo.naina@example.com','Naina Rao','seller'),
  ('20000000-0000-0000-0000-000000000004','demo.kabir@example.com','Kabir Ansari','seller')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.seller_profiles (id, user_id, store_name, store_slug, short_bio, full_story, profile_image_url, cover_image_url, primary_category_id, years_experience, city, state, average_production_days, shipping_regions, supports_ready_to_ship, supports_customized, supports_bespoke, status, reviewed_at) values
  ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Mira Clay Studio','mira-clay-studio','Ceramic home objects from Jaipur.','Mira works with stoneware forms inspired by desert architecture and old blue pottery palettes.','/seed/sellers/mira-profile.jpg','/seed/sellers/mira-cover.jpg','10000000-0000-0000-0000-000000000002',9,'Jaipur','Rajasthan',7,'["India"]',true,true,true,'approved',now()),
  ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','Arjun Paper Co','arjun-paper-co','Scrapbooks and paper goods from Pune.','Arjun builds layered paper keepsakes for weddings, milestones, and family archives.','/seed/sellers/arjun-profile.jpg','/seed/sellers/arjun-cover.jpg','10000000-0000-0000-0000-000000000004',6,'Pune','Maharashtra',5,'["India"]',true,true,true,'approved',now()),
  ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003','Naina Silver Lines','naina-silver-lines','Contemporary jewellery from Bengaluru.','Naina mixes silver, enamel, and textile details for everyday pieces with a craft-first finish.','/seed/sellers/naina-profile.jpg','/seed/sellers/naina-cover.jpg','10000000-0000-0000-0000-000000000003',11,'Bengaluru','Karnataka',10,'["India"]',true,true,false,'approved',now()),
  ('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004','Kabir Wick Works','kabir-wick-works','Botanical candles from Lucknow.','Kabir pours small batches with soy wax, attars, and reusable vessels made with local partners.','/seed/sellers/kabir-profile.jpg','/seed/sellers/kabir-cover.jpg','10000000-0000-0000-0000-000000000005',5,'Lucknow','Uttar Pradesh',4,'["India"]',true,true,true,'approved',now())
on conflict (store_slug) do update set status = excluded.status, short_bio = excluded.short_bio, full_story = excluded.full_story;

insert into public.products (seller_id, category_id, name, slug, short_description, description, product_type, status, base_price, stock_quantity, dispatch_days, production_days, shipping_fee, is_featured, is_customizable, materials, care_instructions) values
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Hand-thrown Breakfast Bowl','hand-thrown-breakfast-bowl','Stoneware bowl with hand-painted rim.','Ready-to-ship ceramic bowl made in small batches.','ready_to_ship','active',1450,12,3,null,120,true,false,'Stoneware clay, glaze','Hand wash recommended'),
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Custom Name Tile','custom-name-tile','Personalized ceramic door tile.','Made-to-order tile with chosen name and palette.','customized','active',2200,null,null,9,150,false,true,'Ceramic, glaze','Wipe clean'),
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Bespoke Tableware Set','bespoke-tableware-set','Commission a tableware set.','Quote-based bespoke set for dinner tables and gifting.','bespoke','active',null,null,null,30,0,false,true,'Stoneware','Care guide included'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004','Wedding Memory Scrapbook','wedding-memory-scrapbook','Layered handmade wedding album.','A customized scrapbook with pockets, tags, and illustrated dividers.','customized','active',3800,null,null,12,180,true,true,'Paper, board, fabric','Keep dry'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Mini Gift Explosion Box','mini-gift-explosion-box','Compact personalized gift box.','Ready base design with custom messages and photos.','customized','active',1250,null,null,6,90,false,true,'Cardstock, ribbon','Keep dry'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004','Travel Journal Kit','travel-journal-kit','Ready-to-ship journaling kit.','Hand-bound journal with stickers and pockets.','ready_to_ship','active',990,20,2,null,80,false,false,'Paper, thread','Keep dry'),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','Silver Lotus Studs','silver-lotus-studs','Minimal silver studs.','Everyday lotus-inspired studs in sterling silver.','ready_to_ship','active',1850,15,2,null,100,true,false,'Sterling silver','Store dry'),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','Custom Birthstone Pendant','custom-birthstone-pendant','Pendant with selected birthstone.','Made-to-order pendant with silver chain.','customized','active',3200,null,null,14,120,false,true,'Sterling silver, gemstone','Avoid perfume'),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','Enamel Bangle Pair','enamel-bangle-pair','Colorful enamel bangles.','Ready-to-ship pair in jewel-toned enamel.','ready_to_ship','active',2400,8,3,null,110,false,false,'Silver, enamel','Store separately'),
  ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000005','Rose Attar Soy Candle','rose-attar-soy-candle','Floral soy candle in reusable tin.','Hand-poured candle with rose attar notes.','ready_to_ship','active',850,30,2,null,70,true,false,'Soy wax, cotton wick','Burn within sight'),
  ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000005','Personalized Festive Candle Set','personalized-festive-candle-set','Custom label candle set.','Choose fragrance, label text, and wrapping.','customized','active',1750,null,null,7,100,false,true,'Soy wax, glass','Burn within sight'),
  ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Corporate Gift Candle Hamper','corporate-gift-candle-hamper','Quote-based bulk gifting hamper.','Bespoke candle hamper for teams and events.','bespoke','active',null,null,null,20,0,false,true,'Soy wax, packaging','Care guide included')
on conflict (slug) do update set name = excluded.name, status = excluded.status;

insert into public.homepage_sections (section_key, title, subtitle, content, display_order) values
  ('featured_categories','Featured Categories','Explore craft-led collections','{}'::jsonb,1),
  ('featured_artisans','Featured Artisans','Meet approved makers','{}'::jsonb,2)
on conflict (section_key) do update set title = excluded.title, subtitle = excluded.subtitle;

