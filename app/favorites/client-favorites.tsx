"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/components/favorites-provider"

type ProductLite = {
  id: string
  slug: string
  title: string
  base_price: number | null
  product_images?: { url: string; alt?: string }[]
}

export default function ClientFavorites() {
  const { favoriteProductIds } = useFavorites()
  const [products, setProducts] = useState<ProductLite[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        if (!favoriteProductIds.length) {
          setProducts([])
          setLoading(false)
          return
        }
        const res = await fetch(`/api/favorites?ids=${encodeURIComponent(favoriteProductIds.join(","))}`, { cache: "no-store" })
        const data = await res.json()
        setProducts(data.products || [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [favoriteProductIds])

  if (loading) {
    return <div className="mt-6 text-sm text-muted-foreground">Caricamento…</div>
  }

  if (!products || products.length === 0) {
    return (
      <div className="mt-10 text-center">
        <p className="text-muted-foreground">Nessun preferito nella sessione.</p>
        <Button asChild className="mt-4">
          <Link href="/catalog">Vai al catalogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
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
        />
      ))}
    </div>
  )
}


