# Handmade Catalog (Next.js + Supabase)

A lightweight e-commerce/catalog app for handmade creations: Next.js App Router, Tailwind CSS, shadcn/ui, Supabase Auth + DB.

Stack: Next.js (app/), TypeScript, Tailwind, shadcn/ui, lucide-react, Supabase (@supabase/supabase-js).

Features:
- Catalog with filters (category) and text search
- Product page with variants, shareable URLs, and "Send request" (saves to `requests`)
- Contacts page with social links and copyable URLs
- Admin (passwordless email OTP) with CRUD for Categories, Products (images, options/values), Config, and JSON import/export
- SEO metadata and sitemap
- Mobile-first neutral UI, product hover cards

Prereqs:
- Node 18+
- Supabase project (Database + Auth)

1) Setup Supabase
- Create a new project at https://supabase.com
- In your Supabase SQL editor, run scripts/001_init.sql then scripts/002_seed.sql

2) Configure environment variables
Create a .env.local with:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

3) Install and run
npm install
npm run dev

4) Admin access
- Visit /admin
- Enter your email and use the magic link to sign in (Supabase Auth passwordless)
- You may need to enable Email provider in Supabase Auth settings.
- RLS policies in 001_init.sql allow authenticated users to write and everyone to read. Adjust policies for production.

Notes:
- Requests: The "Send request" dialog inserts into the `requests` table and shows a toast on success.
- Shareable URLs encode the selection as /product/[slug]?variant=color:green,size:m
- Filters persist in /catalog querystring.
- Placeholder images will render if no images are stored.

Tech references:
- Built with Next.js App Router, data fetching and route conventions per Next.js docs [2].
- Tailwind CSS integration per Next.js CSS guide [3].
- Supabase client and magic link auth per Supabase Next.js quickstart [1].

[1]: https://supabase.com/docs/guides/auth/quickstarts/nextjs
[2]: https://nextjs.org/docs/app/guides/migrating/app-router-migration
[3]: https://nextjs.org/docs/app/getting-started/css
