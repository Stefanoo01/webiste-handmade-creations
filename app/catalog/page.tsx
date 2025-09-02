import { Suspense } from "react"
import { Metadata } from "next"
import Link from "next/link"
import ProductCard from "@/components/product-card"
import CatalogFilters from "@/components/catalog-filters"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse all handmade products. Filter by category, sub-category, and search by title.",
}

async function getProducts(params: { 
  category?: string; 
  subcategory?: string; 
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const supabase = createSupabaseServerClient()
  const baseSelect = "*, product_images!left(url, alt), categories!inner(slug, name)"

  // Helper to build a products query with common joins
  const buildBaseQuery = () =>
    supabase
      .from("products")
      .select(baseSelect, { count: "exact" })

  // Apply filters for category/material to a given query
  const applyCommonFilters = (q: any) => {
    let next = q
    
    // Apply price filters
    if (params.minPrice && params.minPrice !== "") {
      next = next.gte("base_price", parseFloat(params.minPrice))
    }
    if (params.maxPrice && params.maxPrice !== "") {
      next = next.lte("base_price", parseFloat(params.maxPrice))
    }
    
    if (params.subcategory && params.subcategory !== "all") {
      next = next.eq("categories.slug", params.subcategory)
    }
    
    return next
  }

  // Apply sorting
  const applySorting = (q: any) => {
    if (params.sortBy && params.sortOrder) {
      const order = params.sortOrder === "desc" ? "desc" : "asc"
      return q.order(params.sortBy, { ascending: order === "asc" })
    }
    return q
  }

  // If there's a search term, run two queries (title and category) and merge
  if (params.q && params.q.trim() !== "") {
    const q = params.q.trim()

    // Title match
    let titleQuery = buildBaseQuery().ilike("title", `%${q}%`)
    titleQuery = applyCommonFilters(titleQuery)
    titleQuery = applySorting(titleQuery)

    // Category match: first find matching category slugs
    const { data: matchedCategories } = await supabase
      .from("categories")
      .select("slug")
      .or(`name.ilike.%${q}%,slug.ilike.%${q}%`)

    let categoryData: any[] = []
    if (matchedCategories && matchedCategories.length > 0) {
      const slugs = matchedCategories.map((c: any) => c.slug)
      let categoryQuery = buildBaseQuery().in("categories.slug", slugs)
      categoryQuery = applyCommonFilters(categoryQuery)
      categoryQuery = applySorting(categoryQuery)
      const { data: catData, error: catErr } = await categoryQuery
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
  
  // Handle category filtering (this needs to be async)
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
        query = query.eq("categories.slug", params.category)
      } else {
        // This is a main category, get all products from this category and its subcategories
        const { data: subcategorySlugs } = await supabase
          .from("categories")
          .select("slug")
          .or(`slug.eq.${params.category},parent_id.eq.${categoryInfo.id}`)
        
        if (subcategorySlugs && subcategorySlugs.length > 0) {
          const slugs = subcategorySlugs.map((c: any) => c.slug)
          query = query.in("categories.slug", slugs)
        }
      }
    }
  }
  
  query = applyCommonFilters(query)
  query = applySorting(query)

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
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Catalogo</h1>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <Suspense>
            <CatalogFilters
              defaultCategorySlug={params.category ?? "all"}
              defaultQuery={params.q ?? ""}
            />
          </Suspense>
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          {products.length === 0 ? "Nessun prodotto trovato" : `${products.length} prodotti`}
        </h2>
        <Separator className="mb-8" />

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  imageUrls: p.product_images?.map((img: any) => img.url) || [],
                }}
                className={idx % 2 === 0 ? "color-card" : "color-card-2"}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-muted-foreground/40">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">Nessun prodotto trovato</h3>
            <p className="mt-2 text-muted-foreground">
              Prova a modificare i filtri o la ricerca per trovare quello che stai cercando.
            </p>
            <div className="mt-6">
              <Link
                href="/catalog"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Rimuovi tutti i filtri
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
