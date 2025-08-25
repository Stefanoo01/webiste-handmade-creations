export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id?: string | null
  created_at?: string
}



export type Product = {
  id: string
  title: string
  slug: string
  description: string | null
  base_price: number | null
  category_id: string | null
  created_at?: string
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  alt: string | null
}

export type ProductOption = {
  id: string
  product_id: string
  name: string
  option_type: 'option_list' | 'option_list_multi' | 'character' | 'input_text' | 'image_input' | 'image_option_list' | 'checkbox'
  is_mandatory: boolean
  placeholder?: string | null
  validation_rules?: {
    min_length?: number
    max_length?: number
  } | null
}

export type ProductOptionValue = {
  id: string
  option_id: string
  value: string
  image_url: string | null
  price_delta: number | null
}

export type Config = {
  id: number
  email: string | null
  phone: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  updated_at?: string
}
