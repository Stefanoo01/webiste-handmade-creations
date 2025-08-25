"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import VariantSelector from "@/components/variant-selector"
import ProductSnipcartButton from "@/components/product-snipcart-button"
import ShareButtons from "@/components/share-buttons"
import { buildProductShareUrl } from "@/lib/url"

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

  console.log('=== ProductPageWrapper Render ===')
  console.log('currentSelection:', currentSelection)
  console.log('initialVariantParam:', initialVariantParam)

  const handleSelectionChange = (selection: {
    selectedValues: Record<string, string | string[] | File | null | boolean>
    variantDelta: number
    finalPrice: number | null
  }) => {
    console.log('=== ProductPageWrapper Selection Change ===')
    console.log('New selection:', selection)
    console.log('Previous selection:', currentSelection)
    setCurrentSelection(selection)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">{product.title}</h1>
      <p className="mt-2 text-muted-foreground">{product.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {product.categories?.name && <Badge variant="secondary">{product.categories.name}</Badge>}
      </div>

      <Separator className="my-6" />

      <VariantSelector
        productSlug={product.slug}
        options={product.product_options ?? []}
        defaultVariantParam={initialVariantParam}
        images={images}
        basePrice={product.base_price ?? null}
        onSelectionChange={handleSelectionChange}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <ProductSnipcartButton
          product={product}
          images={images}
          initialVariantParam={initialVariantParam}
          currentSelection={currentSelection}
        />
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
