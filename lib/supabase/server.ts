import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export function createSupabaseServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    // In dev preview, this may be undefined; return a dummy client will still error on calls.
    console.warn("Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  }
  return createClient(url ?? "", anon ?? "")
}
