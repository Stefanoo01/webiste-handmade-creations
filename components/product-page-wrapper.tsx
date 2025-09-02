"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import VariantSelector from "@/components/variant-selector"
import ProductSnipcartButton from "@/components/product-snipcart-button"
import ShareButtons from "@/components/share-buttons"
import { buildProductShareUrl } from "@/lib/url"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useFavorites } from "@/components/favorites-provider"

type ProductPageWrapperProps = {
  product: any
  images: Array<{ url: string; alt: string }>
  initialVariantParam: string
}

export default function ProductPageWrapper({
  product,
  images,
  initialVariantParam
}: ProductPageWrapperProps) {
  const [currentSelection, setCurrentSelection] = useState({
    selectedValues: {} as Record<string, string | string[] | File | null | boolean>,
    variantDelta: 0,
    finalPrice: product.base_price
  })

  const { isFavorite, toggleFavorite } = useFavorites()

  const handleSelectionChange = (selection: {
    selectedValues: Record<string, string | string[] | File | null | boolean>
    variantDelta: number
    finalPrice: number | null
  }) => {
    setCurrentSelection(selection)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {product.categories?.name && <Badge variant="secondary">{product.categories.name}</Badge>}
        </div>
        <div className="text-2xl font-semibold">
          {currentSelection.finalPrice !== null
            ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(currentSelection.finalPrice)
            : ""}
        </div>
      </div>

      <Separator />

      <VariantSelector
        productSlug={product.slug}
        options={product.product_options ?? []}
        defaultVariantParam={initialVariantParam}
        images={images}
        basePrice={product.base_price ?? null}
        onSelectionChange={handleSelectionChange}
      />

      <div className="flex flex-wrap gap-2 items-center">
        <ProductSnipcartButton
          product={product}
          images={images}
          initialVariantParam={initialVariantParam}
          currentSelection={currentSelection}
        />

        <Button
          type="button"
          variant={isFavorite(product.id) ? "default" : "primary"}
          className="inline-flex items-center gap-2"
          aria-pressed={isFavorite(product.id)}
          onClick={() => toggleFavorite(product.id, product.title)}
        >
          <Heart className={isFavorite(product.id) ? "h-4 w-4 fill-current" : "h-4 w-4"} />
          {isFavorite(product.id) ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
        </Button>

        <ShareButtons 
          url={buildProductShareUrl(product.slug, { 
            variant: Object.entries(currentSelection.selectedValues)
              .filter(([_, v]) => typeof v === 'string' && v !== '')
              .map(([n, v]) => `${n}:${v}`)
              .join(",")
          })} 
          title={product.title} 
        />
      </div>
    </div>
  )
}
