import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BadgeCheck, Box, Shapes } from 'lucide-react'
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProductCard from "@/components/product-card"
import CategoryImageCarousel from "@/components/category-image-carousel"
import FeaturedProducts from "@/components/featured-products"
import Logo from "../app/WhatsApp_Image_2025-08-21_at_22.43.28-removebg-preview.png"

export const metadata = {
  title: "Handmade Creations — Catalog",
  description: "Discover handmade keychains, earrings, and gadgets crafted with love.",
}

async function getFeatured() {
  const supabase = createSupabaseServerClient()
  const { data: categories } = await supabase.from("categories").select("*").is("parent_id", null).limit(4)
  const { data: products } = await supabase
    .from("products")
    .select("*, product_images!left(url, alt)")
    .limit(10)
  
  // Get products with images for each category
  const categoriesWithImages = await Promise.all(
    (categories ?? []).map(async (category) => {
      const { data: categoryProducts } = await supabase
        .from("products")
        .select("*, product_images!left(url, alt)")
        .eq("category_id", category.id)
        .not("product_images", "is", null)
        .limit(5) // Limit to 5 products per category for performance
      
      return {
        ...category,
        products: categoryProducts ?? []
      }
    })
  )
  
  return { 
    categories: categoriesWithImages, 
    products: products ?? [] 
  }
}

export default async function HomePage() {
  const { categories, products } = await getFeatured()

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Il labirinto di Riri
              </h1>
              <p className="mt-3 text-muted-foreground">
              Benvenuti nel mio piccolo mondo di creazioni! Ogni pezzo che vedete è fatto a mano con amore e un pizzico di magia. Che tu stia cercando qualcosa di speciale per un neonato, un regalo unico per la tua ragazza o un accessorio originale per un adulto, qui troverai l'idea giusta. E se hai un'idea in testa, fammi sapere: ogni creazione è personalizzabile per renderla davvero tua!
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/catalog">
                    Catalogo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="primary">
                  <Link href="/contact">Contattami</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src={Logo}
                alt="Handmade items"
                width={400}
                height={400}
                className="ml-auto rounded-xl border object-cover shadow-sm bg-[#fccfda]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <FeaturedProducts products={products} />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 flex items-center gap-2">
          <Shapes className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Categoria in evidenza</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.length === 0 && (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Nessuna categoria momentaneamente.
              </CardContent>
            </Card>
          )}
          {categories.map((c, idx) => (
            <Card key={c.id} className="group">
              <Link href={`/catalog?category=${encodeURIComponent(c.slug)}`} className="block">
                <CardHeader>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {c.products && c.products.length > 0 ? (
                    <div className="relative h-28 w-full overflow-hidden rounded-md border">
                      {c.products.length === 1 ? (
                        <Image
                          src={c.products[0].product_images?.[0]?.url ?? "/handmade-product.png"}
                          alt={c.products[0].product_images?.[0]?.alt ?? c.name}
                          width={560}
                          height={280}
                          className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                        />
                      ) : (
                        <CategoryImageCarousel 
                          images={c.products.flatMap((p: any) => 
                            p.product_images?.map((img: any) => img.url) ?? []
                          ).filter(Boolean)}
                          alt={c.name}
                        />
                      )}
                    </div>
                  ) : (
                    <Image
                      src="/abstract-neutral-pattern.png"
                      alt={c.name}
                      width={560}
                      height={280}
                      className="h-28 w-full rounded-md border object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
