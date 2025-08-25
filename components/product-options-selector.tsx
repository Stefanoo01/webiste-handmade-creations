"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

type ProductOptionsSelectorProps = {
  options: ProductOption[]
  onSelectionChange: (selection: {
    selectedValues: Record<string, string | string[] | File | null | boolean>
    variantDelta: number
    finalPrice: number | null
    basePrice: number | null
  }) => void
  basePrice: number | null
}

export default function ProductOptionsSelector({
  options,
  onSelectionChange,
  basePrice
}: ProductOptionsSelectorProps) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string | string[] | File | null | boolean>>({})
  const [uploadedImages, setUploadedImages] = useState<Record<string, File | null>>({})
  const [textInputs, setTextInputs] = useState<Record<string, string>>({})
  const initializedRef = useRef(false)
  const optionsRef = useRef<string>('')

  // Create a stable options signature for comparison
  const optionsSignature = useMemo(() => {
    return options.map(o => `${o.name}:${o.option_type}:${o.id}`).join('|')
  }, [options])

  // Initialize values only once when component mounts or options change significantly
  useEffect(() => {
    // Only initialize if we haven't done it before OR if options have changed significantly
    if (!initializedRef.current || optionsRef.current !== optionsSignature) {
      const initialValues: Record<string, string | string[] | File | null | boolean> = {}
      
      options.forEach(option => {
        if (option.option_type === 'character') {
          // Set default based on whether it's mandatory
          initialValues[option.name] = option.is_mandatory ? 'A' : 'none'
        } else if (option.option_type === 'option_list' && option.product_option_values && option.product_option_values.length > 0) {
          // Set default to first option for single select
          initialValues[option.name] = option.product_option_values[0].value
        } else if (option.option_type === 'option_list_multi') {
          // Initialize multi-select as empty array
          initialValues[option.name] = []
        } else if (option.option_type === 'input_text') {
          // Initialize text input as empty string
          initialValues[option.name] = ''
        } else if (option.option_type === 'image_input' || option.option_type === 'image_option_list') {
          // Initialize image options as null
          initialValues[option.name] = null
        } else if (option.option_type === 'checkbox') {
          // Initialize checkbox as false
          initialValues[option.name] = false
        }
      })
      
      setSelectedValues(initialValues)
      initializedRef.current = true
      optionsRef.current = optionsSignature
    }
  }, [optionsSignature])

  // Generate alphabet for character options
  const generateAlphabet = () => {
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
  }

  // Handle option selection
  const handleOptionChange = (optionName: string, value: string | string[] | File | null | boolean) => {
    const newSelectedValues = { ...selectedValues, [optionName]: value }
    setSelectedValues(newSelectedValues)
    
    // Calculate price delta
    let variantDelta = 0
    Object.entries(newSelectedValues).forEach(([name, val]) => {
      if (typeof val === 'string' && val !== '') {
        const option = options.find(o => o.name === name)
        if (option?.option_type === 'option_list' || option?.option_type === 'image_option_list') {
          const choice = option.product_option_values?.find(v => v.value === val)
          if (choice?.price_delta) {
            variantDelta += Number(choice.price_delta)
          }
        }
      }
    })

    const finalPrice = basePrice !== null ? basePrice + variantDelta : null
    
    // Call parent callback
    onSelectionChange({
      selectedValues: newSelectedValues,
      variantDelta,
      finalPrice,
      basePrice
    })
  }

  // Handle multi-select
  const handleMultiSelect = (optionName: string, value: string) => {
    const currentValues = selectedValues[optionName] as string[] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    handleOptionChange(optionName, newValues)
  }

  // Handle text input
  const handleTextInput = (optionName: string, value: string) => {
    setTextInputs(prev => ({ ...prev, [optionName]: value }))
    handleOptionChange(optionName, value)
  }

  // Handle image upload
  const handleImageUpload = (optionName: string, file: File | null) => {
    setUploadedImages(prev => ({ ...prev, [optionName]: file }))
    handleOptionChange(optionName, file)
  }

  // Handle checkbox
  const handleCheckboxChange = (optionName: string, checked: boolean) => {
    handleOptionChange(optionName, checked)
  }

  // Check if option is valid (for mandatory fields)
  const isOptionValid = (option: ProductOption) => {
    const value = selectedValues[option.name]
    
    if (!option.is_mandatory) return true
    
    if (option.option_type === 'option_list' || option.option_type === 'image_option_list') {
      return typeof value === 'string' && value !== ''
    } else if (option.option_type === 'option_list_multi') {
      return Array.isArray(value) && value.length > 0
    } else if (option.option_type === 'character') {
      return typeof value === 'string' && value !== '' && value !== 'none'
    } else if (option.option_type === 'input_text') {
      return typeof value === 'string' && value.trim() !== ''
    } else if (option.option_type === 'image_input') {
      return value instanceof File
    } else if (option.option_type === 'checkbox') {
      return typeof value === 'boolean'
    }
    
    return false
  }

  // Render option based on type
  const renderOption = (option: ProductOption) => {
    const isSelected = (value: string) => {
      const selectedValue = selectedValues[option.name]
      if (option.option_type === 'option_list_multi') {
        return Array.isArray(selectedValue) && selectedValue.includes(value)
      }
      return selectedValue === value
    }

    switch (option.option_type) {
      case 'option_list':
        return (
          <div className="flex flex-wrap gap-2">
            {option.product_option_values?.map((val) => (
              <button
                key={val.id}
                onClick={() => handleOptionChange(option.name, val.value)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:bg-secondary hover:text-secondary-foreground transition-colors",
                  isSelected(val.value) && "bg-secondary text-secondary-foreground"
                )}
              >
                {val.image_url && (
                  <Image
                    src={val.image_url}
                    alt={`${option.name} ${val.value}`}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                <span>{val.value}</span>
                {val.price_delta && (
                  <span className="text-muted-foreground">+€{val.price_delta}</span>
                )}
              </button>
            ))}
          </div>
        )

      case 'option_list_multi':
        return (
          <div className="flex flex-wrap gap-2">
            {option.product_option_values?.map((val) => (
              <button
                key={val.id}
                onClick={() => handleMultiSelect(option.name, val.value)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:bg-secondary hover:text-secondary-foreground transition-colors",
                  isSelected(val.value) && "bg-secondary text-secondary-foreground"
                )}
              >
                {val.image_url && (
                  <Image
                    src={val.image_url}
                    alt={`${option.name} ${val.value}`}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                <span>{val.value}</span>
                {val.price_delta && (
                  <span className="text-muted-foreground">+€{val.price_delta}</span>
                )}
              </button>
            ))}
          </div>
        )

      case 'character':
        return (
          <div className="space-y-2">
            <Select
              value={selectedValues[option.name] as string || (option.is_mandatory ? 'A' : 'none')}
              onValueChange={(value) => handleOptionChange(option.name, value === 'none' ? '' : value)}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue>
                  {(selectedValues[option.name] as string) === 'none' ? 'Nessuna lettera' : 
                   selectedValues[option.name] as string || (option.is_mandatory ? 'A' : 'Nessuna lettera')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {!option.is_mandatory && (
                  <SelectItem value="none">
                    Nessuna lettera
                  </SelectItem>
                )}
                {generateAlphabet().map((letter) => (
                  <SelectItem key={letter} value={letter}>
                    {letter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'input_text':
        return (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={option.placeholder || `Inserisci ${option.name}`}
              value={textInputs[option.name] || ''}
              onChange={(e) => handleTextInput(option.name, e.target.value)}
              className="max-w-xs"
            />
          </div>
        )

      case 'image_input':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(option.name, e.target.files?.[0] || null)}
              className="max-w-xs"
            />
            {uploadedImages[option.name] && (
              <div className="text-xs text-muted-foreground">
                Immagine selezionata: {uploadedImages[option.name]?.name}
              </div>
            )}
          </div>
        )

      case 'image_option_list':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {option.product_option_values?.map((val) => (
              <button
                key={val.id}
                onClick={() => handleOptionChange(option.name, val.value)}
                className={cn(
                  "relative aspect-square rounded-lg border-2 overflow-hidden hover:border-primary transition-colors",
                  isSelected(val.value) && "border-primary ring-2 ring-primary/20"
                )}
              >
                {val.image_url && (
                  <Image
                    src={val.image_url}
                    alt={`${option.name} ${val.value}`}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  {val.value}
                  {val.price_delta && ` +€${val.price_delta}`}
                </div>
              </button>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${option.id}`}
              checked={selectedValues[option.name] as boolean || false}
              onCheckedChange={(checked) => handleCheckboxChange(option.name, checked as boolean)}
            />
            <Label htmlFor={`checkbox-${option.id}`} className="text-sm">
              {option.placeholder || `Seleziona ${option.name}`}
            </Label>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {options.map((option) => (
        <div key={option.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium capitalize">
              {option.name}
              {option.is_mandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {!isOptionValid(option) && option.is_mandatory && (
              <span className="text-xs text-red-500">Campo obbligatorio</span>
            )}
          </div>
          
          {renderOption(option)}
          
          {/* Show validation rules only for input_text options */}
          {option.option_type === 'input_text' && option.validation_rules && (
            <div className="text-xs text-muted-foreground">
              {option.validation_rules.min_length && `Minimo ${option.validation_rules.min_length} caratteri`}
              {option.validation_rules.min_length && option.validation_rules.max_length && ' • '}
              {option.validation_rules.max_length && `Massimo ${option.validation_rules.max_length} caratteri`}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
