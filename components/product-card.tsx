"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import ProductImageCarousel from "./product-image-carousel"
import { Heart, Eye } from "lucide-react"
import { useEffect } from "react"
import { useFavorites } from "@/components/favorites-provider"

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

  const { isFavorite, toggleFavorite } = useFavorites()

  // Ensure session is initialized on mount (no-op but guarantees client only)
  useEffect(() => {}, [])

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50",
      "bg-gradient-to-br from-card to-card/80 backdrop-blur-sm",
      className
    )}>
      {/* Media */}
      <div className="relative aspect-square w-full overflow-hidden">
        {product.imageUrls && product.imageUrls.length > 1 ? (
          <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
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
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex gap-2">
              <Link href={href} className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110">
                <Eye className="h-4 w-4 text-foreground" />
              </Link>
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id, product.title) }} aria-pressed={isFavorite(product.id)} className={cn(
                "p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110",
                "bg-white/90 hover:bg-white"
              )}>
                {isFavorite(product.id) ? (
                  <Heart className="h-4 w-4 fill-current text-destructive" />
                ) : (
                  <Heart className="h-4 w-4 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Price badge */}
        {product.base_price && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground font-medium px-3 py-1">
              {formatPrice(product.base_price)}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Content */}
      <Link href={href} className="block">
        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
              {product.title}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {product.base_price ? (
                  <span className="font-medium text-foreground">
                    {formatPrice(product.base_price)}
                  </span>
                ) : (
                  <span className="text-primary font-medium">Prezzo su richiesta</span>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Clicca per dettagli →
              </div>
            </div>
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
