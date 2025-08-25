export function buildProductShareUrl(
  slug: string,
  params?: { variant?: string } | Record<string, string | string[] | undefined>
) {
  const search = new URLSearchParams()
  const variant = (params as any)?.variant
  if (variant) search.set("variant", String(variant))
  const qs = search.toString()
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${slug}`
      : `${(process as any).env?.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/product/${slug}`
  return qs ? `${base}?${qs}` : base
}
