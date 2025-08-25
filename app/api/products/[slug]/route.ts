import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        categories(name, slug),
        product_images(url, alt),

        product_options(
          id, name, type,
          product_option_values(id, value, image_url, price_delta)
        )
      `)
      .eq("slug", params.slug)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
