import { Suspense } from "react"
import { Metadata } from "next"
import ProductCard from "@/components/product-card"
import CatalogFilters from "@/components/catalog-filters"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse all handmade products. Filter by category, sub-category, and search by title.",
}

async function getProducts(params: { category?: string; subcategory?: string; q?: string }) {
  const supabase = createSupabaseServerClient()
  const baseSelect = "*, product_images!left(url, alt), categories!inner(slug, name)"

  // Helper to build a products query with common joins
  const buildBaseQuery = () =>
    supabase
      .from("products")
      .select(baseSelect, { count: "exact" })

  // Apply filters for category/material to a given query
  const applyCommonFilters = async (q: any) => {
    let next = q
    if (params.category && params.category !== "all") {
      // Check if the selected category is a subcategory
      const { data: categoryInfo } = await supabase
        .from("categories")
        .select("id, parent_id")
        .eq("slug", params.category)
        .single()
      
      if (categoryInfo) {
        if (categoryInfo.parent_id) {
          // This is a subcategory, filter by subcategory
          next = next.eq("categories.slug", params.category)
        } else {
          // This is a main category, get all products from this category and its subcategories
          const { data: subcategorySlugs } = await supabase
            .from("categories")
            .select("slug")
            .or(`slug.eq.${params.category},parent_id.eq.${categoryInfo.id}`)
          
          if (subcategorySlugs && subcategorySlugs.length > 0) {
            const slugs = subcategorySlugs.map((c: any) => c.slug)
            next = next.in("categories.slug", slugs)
          }
        }
      }
    }
    if (params.subcategory && params.subcategory !== "all") {
      next = next.eq("categories.slug", params.subcategory)
    }
    return next
  }

  // If there's a search term, run two queries (title and category) and merge
  if (params.q && params.q.trim() !== "") {
    const q = params.q.trim()

    // Title match
    let titleQuery = buildBaseQuery().ilike("title", `%${q}%`)
    titleQuery = await applyCommonFilters(titleQuery)

    // Category match: first find matching category slugs
    const { data: matchedCategories } = await supabase
      .from("categories")
      .select("slug")
      .or(`name.ilike.%${q}%,slug.ilike.%${q}%`)

    let categoryData: any[] = []
    if (matchedCategories && matchedCategories.length > 0) {
      const slugs = matchedCategories.map((c: any) => c.slug)
      let categoryQuery = buildBaseQuery().in("categories.slug", slugs)
      categoryQuery = await applyCommonFilters(categoryQuery)
      const { data: catData, error: catErr } = await categoryQuery.limit(60)
      if (!catErr && catData) categoryData = catData
    }

    const [{ data: titleData, error: titleErr }] = await Promise.all([
      titleQuery,
    ])

    if (titleErr) {
      console.error("getProducts title search error:", titleErr.message)
    }

    const combined = [...(titleData ?? []), ...categoryData]
    const uniqueById = Array.from(new Map(combined.map((p: any) => [p.id, p])).values())
    return uniqueById.slice(0, 60)
  }

  // No search term: single query with any filters
  let query = buildBaseQuery()
  query = await applyCommonFilters(query)

  const { data, error } = await query
  if (error) {
    console.error("getProducts error:", error.message)
    return []
  }
  return data
}

export default async function CatalogPage({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  const products = await getProducts({
    category: params.category,
    subcategory: params.subcategory,
    q: params.q,
  });

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Catalogo</h1>
      <Suspense>
        <CatalogFilters
          defaultCategorySlug={params.category ?? "all"}
          defaultQuery={params.q ?? ""}
        />
      </Suspense>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p, idx) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              slug: p.slug,
              title: p.title,
              base_price: p.base_price,
              imageUrl: p.product_images?.[0]?.url ?? "/handmade-product.png",
              imageAlt: p.product_images?.[0]?.alt ?? p.title,
            }}
            className={idx % 2 === 0 ? "color-card" : "color-card-2"}
          />
        ))}
        {products.length === 0 && <div className="text-sm text-muted-foreground">Nessun prodotto corrisponde ai tuoi filtri.</div>}
      </div>
    </main>
  )
}
