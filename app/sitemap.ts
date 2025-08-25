import { MetadataRoute } from "next"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "http://localhost:3000"

  const supabase = createSupabaseServerClient()
  const { data: products } = await supabase.from("products").select("slug").limit(1000)

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${origin}/`, priority: 1, changeFrequency: "weekly", lastModified: new Date() },
    { url: `${origin}/catalog`, priority: 0.8, changeFrequency: "weekly", lastModified: new Date() },
    { url: `${origin}/contact`, priority: 0.5, changeFrequency: "monthly", lastModified: new Date() },
  ]

  const productRoutes: MetadataRoute.Sitemap =
    (products ?? []).map((p) => ({
      url: `${origin}/product/${p.slug}`,
      priority: 0.7,
      changeFrequency: "weekly",
      lastModified: new Date(),
    })) ?? []

  return [...staticRoutes, ...productRoutes]
}
