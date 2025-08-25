"use client"

import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ProductCard from "./product-card"

type FeaturedProductsProps = {
  products: Array<{
    id: string
    slug: string
    title: string
    base_price?: number | null
    product_images?: Array<{
      url: string
      alt?: string
    }> | null
  }>
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const scrollLeft = () => {
    const container = document.getElementById('featured-products-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('featured-products-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Prodotti in evidenza</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/catalog" className="hover:underline">
            Scopri tutti
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="relative group">
        {/* Left Navigation Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-3/4 z-10 bg-background/95 hover:bg-background border border-primary text-primary shadow-sm opacity-0 group-hover:opacity-70 transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-primary-foreground rounded-full p-2"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        {/* Right Navigation Button */}
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-3/4 z-10 bg-background/95 hover:bg-background border border-primary text-primary shadow-sm opacity-0 group-hover:opacity-70 transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-primary-foreground rounded-full p-2"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        
        <div 
          id="featured-products-scroll"
          className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        >
          {products.map((p) => (
            <div key={p.id} className="flex-shrink-0 w-64">
              <ProductCard
                product={{
                  id: p.id,
                  slug: p.slug,
                  title: p.title,
                  base_price: p.base_price,
                  imageUrl: p.product_images?.[0]?.url ?? "/handmade-product.png",
                  imageAlt: p.product_images?.[0]?.alt ?? p.title,
                  imageUrls: p.product_images?.map((img: any) => img.url) ?? [],
                }}
              />
            </div>
          ))}
          {products.length === 0 && (
            <div className="flex-shrink-0 w-64">
              <Card>
                <CardContent className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
                  Nessun prodotto momentaneamente.
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
