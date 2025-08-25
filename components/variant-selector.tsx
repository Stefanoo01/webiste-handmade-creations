"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { buildProductShareUrl } from "@/lib/url"
import ProductOptionsSelector from "@/components/product-options-selector"

type ProductOption = {
  id: string
  name: string
  option_type: 'option_list' | 'option_list_multi' | 'character' | 'input_text' | 'image_input' | 'image_option_list' | 'checkbox'
  is_mandatory: boolean
  placeholder?: string | null
  validation_rules?: {
    min_length?: number
    max_length?: number
  } | null
  product_option_values?: Array<{
    id: string
    value: string
    image_url?: string | null
    price_delta?: number | null
  }> | null
}

type VariantSelectorProps = {
  productSlug?: string
  options?: ProductOption[]
  images?: { url: string; alt: string }[]
  defaultVariantParam?: string
  basePrice?: number | null
  onSelectionChange?: (selection: {
    selectedValues: Record<string, string | string[] | File | null | boolean>
    variantDelta: number
    finalPrice: number | null
  }) => void
}

export default function VariantSelector({
  productSlug = "product",
  options = [],
  images = [],
  defaultVariantParam = "",
  basePrice = null,
  onSelectionChange,
}: VariantSelectorProps) {
  const router = useRouter()
  const [selectedValues, setSelectedValues] = useState<Record<string, string | string[] | File | null | boolean>>({})
  const [variantDelta, setVariantDelta] = useState(0)

  useEffect(() => {
    // parse defaultVariantParam like "color:green,size:m"
    if (defaultVariantParam) {
      const obj: Record<string, string> = {}
      defaultVariantParam.split(",").forEach((pair) => {
        const [name, val] = pair.split(":")
        if (name && val) obj[name] = val
      })
      setSelectedValues(obj)
    }
  }, [defaultVariantParam])

  const variantPreviewImage = useMemo(() => {
    // if selected value has image, show it
    const pairs = Object.entries(selectedValues)
    for (const [name, val] of pairs) {
      if (typeof val === 'string' && val !== '') {
        const opt = options.find((o) => o.name === name)
        const choice = opt?.product_option_values?.find((v: any) => v.value === val)
        if (choice?.image_url) return choice.image_url
      }
    }
    return images?.[0]?.url
  }, [selectedValues, options, images])

  const priceText =
    basePrice !== null ? formatPrice((basePrice ?? 0) + variantDelta) : variantDelta ? `+ ${formatPrice(variantDelta)}` : "Custom"

  const updateUrl = (next: { variant?: string }) => {
    const url = buildProductShareUrl(productSlug, next)
    // Use push with scroll: false to prevent jumping to top
    router.push(url, { scroll: false })
  }

  const handleOptionsSelectionChange = (selection: {
    selectedValues: Record<string, string | string[] | File | null | boolean>
    variantDelta: number
    finalPrice: number | null
    basePrice: number | null
  }) => {
    console.log('=== VariantSelector Options Selection Change ===')
    console.log('New selection:', selection)
    console.log('Current selectedValues:', selectedValues)
    
    setSelectedValues(selection.selectedValues)
    setVariantDelta(selection.variantDelta)
    
    // Only update URL if there are actual string values to update
    const stringValues = Object.entries(selection.selectedValues)
      .filter(([_, v]) => typeof v === 'string' && v !== '')
    
    if (stringValues.length > 0) {
      const variantParam = stringValues
        .map(([n, v]) => `${n}:${v}`)
        .join(",")
      updateUrl({ variant: variantParam })
    }
    
    // Notify parent of selection change
    if (onSelectionChange) {
      console.log('Calling onSelectionChange with:', {
        selectedValues: selection.selectedValues,
        variantDelta: selection.variantDelta,
        finalPrice: selection.finalPrice
      })
      onSelectionChange({
        selectedValues: selection.selectedValues,
        variantDelta: selection.variantDelta,
        finalPrice: selection.finalPrice
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">{priceText}</div>
      </div>

      {options.length > 0 && (
        <div className="space-y-4">
          <div className="text-lg font-medium">Personalizza il tuo prodotto</div>
          <ProductOptionsSelector
            options={options}
            onSelectionChange={handleOptionsSelectionChange}
            basePrice={basePrice}
          />
        </div>
      )}

      {variantPreviewImage && (
        <div>
          <div className="text-sm font-medium">Preview variante</div>
          <Image
            src={variantPreviewImage || "/placeholder.svg"}
            alt="Variant preview"
            width={600}
            height={400}
            className="mt-2 w-full rounded-lg border object-cover"
          />
        </div>
      )}
    </div>
  )
}

function formatPrice(n: number) {
  try {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n)
  } catch {
    return `€${n}`
  }
}
