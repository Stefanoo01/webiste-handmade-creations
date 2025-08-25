-- Schema initialization
create extension if not exists "uuid-ossp";

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz default now()
);

create index if not exists idx_categories_slug on public.categories(slug);



create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  base_price numeric,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_title_trgm on public.products using gin (title gin_trgm_ops);



create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  url text not null,
  alt text
);

create table if not exists public.product_options (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  name text not null,
  type text not null check (type in ('single','multi'))
);

create table if not exists public.product_option_values (
  id uuid primary key default uuid_generate_v4(),
  option_id uuid references public.product_options(id) on delete cascade,
  value text not null,
  image_url text,
  price_delta numeric
);

create table if not exists public.config (
  id int primary key default 1,
  email text,
  phone text,
  instagram text,
  facebook text,
  tiktok text,
  about_title text,
  about_description text,
  about_image_url text,
  updated_at timestamptz default now()
);

create table if not exists public.requests (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete set null,

  selected_variants jsonb,
  user_name text,
  user_email text,
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS (adjust policies as needed for your app)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_options enable row level security;
alter table public.product_option_values enable row level security;
alter table public.config enable row level security;
alter table public.requests enable row level security;

-- Simple policies: allow read to anon, write to authenticated
do $$
begin
  perform 1;
exception
  when others then
    null;
end $$;

create policy if not exists read_categories on public.categories for select using (true);
create policy if not exists write_categories on public.categories for insert with check (auth.role() = 'authenticated');
create policy if not exists update_categories on public.categories for update using (auth.role() = 'authenticated');
create policy if not exists delete_categories on public.categories for delete using (auth.role() = 'authenticated');



create policy if not exists read_products on public.products for select using (true);
create policy if not exists write_products on public.products for insert with check (auth.role() = 'authenticated');
create policy if not exists update_products on public.products for update using (auth.role() = 'authenticated');
create policy if not exists delete_products on public.products for delete using (auth.role() = 'authenticated');

create policy if not exists read_product_images on public.product_images for select using (true);
create policy if not exists write_product_images on public.product_images for insert with check (auth.role() = 'authenticated');
create policy if not exists delete_product_images on public.product_images for delete using (auth.role() = 'authenticated');

create policy if not exists read_product_options on public.product_options for select using (true);
create policy if not exists write_product_options on public.product_options for insert with check (auth.role() = 'authenticated');
create policy if not exists delete_product_options on public.product_options for delete using (auth.role() = 'authenticated');

create policy if not exists read_product_option_values on public.product_option_values for select using (true);
create policy if not exists write_product_option_values on public.product_option_values for insert with check (auth.role() = 'authenticated');
create policy if not exists delete_product_option_values on public.product_option_values for delete using (auth.role() = 'authenticated');

create policy if not exists read_config on public.config for select using (true);
create policy if not exists write_config on public.config for insert with check (auth.role() = 'authenticated');
create policy if not exists update_config on public.config for update using (auth.role() = 'authenticated');

create policy if not exists read_requests on public.requests for select using (auth.role() = 'authenticated'); -- private
create policy if not exists write_requests on public.requests for insert with check (true);
