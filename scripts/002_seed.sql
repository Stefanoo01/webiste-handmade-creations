-- Seed data
insert into public.categories (name, slug, description)
values
  ('Keychains', 'keychains', 'Handmade keychains'),
  ('Earrings', 'earrings', 'Handmade earrings')
on conflict (slug) do nothing;



-- Create product: Octopus Keychain
with cat as (
  select id from public.categories where slug = 'keychains' limit 1
)
insert into public.products (title, slug, description, base_price, category_id)
select 'Octopus Keychain', 'octopus-keychain', 'Cute octopus keychain with color variants', 12.00, cat.id
from cat
on conflict (slug) do nothing;



-- Images
insert into public.product_images (product_id, url, alt)
select p.id, 'https://picsum.photos/seed/octo1/800/600', 'Octopus angle 1'
from public.products p where p.slug = 'octopus-keychain'
on conflict do nothing;

insert into public.product_images (product_id, url, alt)
select p.id, 'https://picsum.photos/seed/octo2/800/600', 'Octopus angle 2'
from public.products p where p.slug = 'octopus-keychain'
on conflict do nothing;

-- Options and values
with prod as (select id from public.products where slug = 'octopus-keychain')
, ins_opt as (
  insert into public.product_options (product_id, name, type)
  select id, 'color', 'single' from prod
  returning id
)
insert into public.product_option_values (option_id, value, image_url, price_delta)
select id, 'green', 'https://picsum.photos/seed/green/400/300', null from ins_opt
union all
select id, 'red', 'https://picsum.photos/seed/red/400/300', null from ins_opt
union all
select id, 'blue', 'https://picsum.photos/seed/blue/400/300', null from ins_opt;

-- Config default row
insert into public.config (id, email, phone, instagram, facebook, tiktok)
values (1, 'hello@example.com', '+1 555 123 4567', 'https://instagram.com/yourshop', 'https://facebook.com/yourshop', 'https://tiktok.com/@yourshop')
on conflict (id) do update set updated_at = now();
