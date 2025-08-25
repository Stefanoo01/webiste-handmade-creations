"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

// Declare Snipcart global type
declare global {
  interface Window {
    Snipcart?: {
      api: {
        configure: (key: string, value: string) => void;
      };
    };
  }
}

type ProductSnipcartButtonProps = {
  product: {
    id: string
    title: string
    base_price: number | null
    slug: string
    product_options?: Array<{
      id: string
      name: string
      option_type: string
      is_mandatory: boolean
      product_option_values?: Array<{
        id: string
        value: string
        image_url?: string
        price_delta?: number | null
      }> | null
    }> | null
  }
  images: Array<{ url: string; alt: string }>
  initialVariantParam: string
  currentSelection?: {
    selectedValues: Record<string, string | string[] | File | null | boolean>
    variantDelta: number
    finalPrice: number | null
  }
}

export default function ProductSnipcartButton({ 
  product, 
  images, 
  initialVariantParam, 
  currentSelection 
}: ProductSnipcartButtonProps) {
  // Use currentSelection directly instead of maintaining internal state
  const selection = currentSelection ? {
    selectedValues: currentSelection.selectedValues,
    variantDelta: currentSelection.variantDelta,
    finalPrice: currentSelection.finalPrice
  } : {
    selectedValues: {} as Record<string, string | string[] | File | null | boolean>,
    variantDelta: 0,
    finalPrice: product.base_price
  }

  // Check if all mandatory options are filled
  const areMandatoryOptionsFilled = () => {
    if (!product.product_options) return true
    
    console.log('=== ProductSnipcartButton Debug ===')
    console.log('currentSelection:', currentSelection)
    console.log('selection:', selection)
    console.log('product options:', product.product_options.map(o => ({ name: o.name, mandatory: o.is_mandatory, type: o.option_type })))
    
    for (const option of product.product_options) {
      if (option.is_mandatory) {
        const value = selection.selectedValues[option.name]
        console.log(`Option ${option.name} (${option.option_type}): value =`, value, 'type =', typeof value)
        
        if (value === undefined || value === null) {
          console.log(`❌ Option ${option.name} is not filled`)
          return false
        }
        
        if (option.option_type === 'option_list' || option.option_type === 'image_option_list') {
          if (typeof value !== 'string' || value === '') return false
        } else if (option.option_type === 'option_list_multi') {
          if (!Array.isArray(value) || value.length === 0) return false
        } else if (option.option_type === 'character') {
          if (typeof value !== 'string' || value === '' || value === 'none') return false
        } else if (option.option_type === 'input_text') {
          if (typeof value !== 'string' || value.trim() === '') return false
        } else if (option.option_type === 'image_input') {
          if (!(value instanceof File)) return false
        } else if (option.option_type === 'checkbox') {
          // For checkbox, we just need to ensure it's a boolean value
          if (typeof value !== 'boolean') return false
        }
      }
    }
    
    console.log('✅ All mandatory options are filled!')
    return true
  }

  // Build custom fields for Snipcart
  const buildCustomFields = () => {
    const fields: Record<string, string> = {}
    let fieldIndex = 1
    
    Object.entries(selection.selectedValues).forEach(([name, value]) => {
      if (value) {
        if (typeof value === 'string') {
          fields[`data-item-custom${fieldIndex}-name`] = name
          fields[`data-item-custom${fieldIndex}-type`] = 'textbox'
          fields[`data-item-custom${fieldIndex}-value`] = value
          fieldIndex++
        } else if (Array.isArray(value)) {
          fields[`data-item-custom${fieldIndex}-name`] = name
          fields[`data-item-custom${fieldIndex}-type`] = 'textbox'
          fields[`data-item-custom${fieldIndex}-value`] = value.join(', ')
          fieldIndex++
        } else if (value instanceof File) {
          fields[`data-item-custom${fieldIndex}-name`] = name
          fields[`data-item-custom${fieldIndex}-type`] = 'textbox'
          fields[`data-item-custom${fieldIndex}-value`] = value.name
          fieldIndex++
        } else if (typeof value === 'boolean') {
          fields[`data-item-custom${fieldIndex}-name`] = name
          fields[`data-item-custom${fieldIndex}-type`] = 'textbox'
          fields[`data-item-custom${fieldIndex}-value`] = value ? 'Sì' : 'No'
          fieldIndex++
        }
      }
    })
    
    return fields
  }

  const customFields = buildCustomFields()

  return (
    <Button
      className="snipcart-add-item"
      data-item-id={`${product.id}-${Object.entries(selection.selectedValues).filter(([_, v]) => typeof v === 'string' && v !== '').map(([k, v]) => `${k}:${v}`).join(',')}`}
      data-item-name={product.title}
      data-item-price={selection.finalPrice ?? product.base_price}
      data-item-url={`/product/${product.slug}`}
      data-item-image={images[0]?.url ?? "/handmade-product.png"}
      data-item-currency="eur"
      data-item-taxable="false"
      data-item-weight="0"
      disabled={!selection.finalPrice || !areMandatoryOptionsFilled()}
      {...customFields}
    >
      <ShoppingCart />
      <span>Aggiungi al carrello</span>
    </Button>
  )
}
