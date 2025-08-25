"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import ProductImageCarousel from "./product-image-carousel"

type ProductCardProps = {
  product?: {
    id: string
    slug: string
    title: string
    base_price?: number | null
    imageUrl?: string
    imageAlt?: string
    imageUrls?: string[]

  }
  className?: string
}

export default function ProductCard({
  product = {
    id: "id",
    slug: "slug",
    title: "Product",
    base_price: null,
    imageUrl: "/handmade-product.png",
    imageAlt: "Product",
  },
  className,
}: ProductCardProps) {
  const href = `/product/${product.slug}`
  return (
    <Card className={cn("group overflow-hidden", className)}>
      <Link href={href} className="block">
        {product.imageUrls && product.imageUrls.length > 1 ? (
          <div className="aspect-square w-full rounded-b-none border-b overflow-hidden p-2 transition-transform group-hover:scale-[1.02]">
            <ProductImageCarousel 
              images={product.imageUrls}
              alt={product.imageAlt || product.title}
            />
          </div>
        ) : (
          <Image
            src={product.imageUrl || "/placeholder.svg?height=400&width=400&query=handmade%20product"}
            alt={product.imageAlt || product.title}
            width={400}
            height={400}
            className="aspect-square w-full rounded-b-none border-b object-cover transition-transform group-hover:scale-[1.02] p-2"
          />
        )}
        <CardContent className="p-3">
          <div className="line-clamp-1 font-medium">{product.title}</div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{product.base_price ? `~ ${formatPrice(product.base_price)}` : "Custom"}</div>

          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

function formatPrice(n: number) {
  try {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n)
  } catch {
    return `€${n}`
  }
}
