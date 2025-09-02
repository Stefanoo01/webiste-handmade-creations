import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const idsParam = url.searchParams.get("ids")
    const ids = (idsParam ? idsParam.split(",") : []).filter(Boolean)

    if (!ids.length) {
      return NextResponse.json({ products: [] })
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, title, base_price, product_images(url, alt)")
      .in("id", ids)

    if (error) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }

    return NextResponse.json({ products: data ?? [] })
  } catch (e) {
    return NextResponse.json({ products: [] }, { status: 200 })
  }
}


