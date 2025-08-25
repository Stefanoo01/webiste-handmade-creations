import { Metadata, ResolvingMetadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import ProductPageWrapper from "@/components/product-page-wrapper"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { buildProductShareUrl } from "@/lib/url"

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ variant?: string }>
}

async function getProduct(slug: string) {
  const supabase = createSupabaseServerClient()
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(name, slug),
      product_images(url, alt),
      product_options(
        id, name, option_type, is_mandatory, placeholder, validation_rules,
        product_option_values(id, value, image_url, price_delta)
      )
    `)
    .eq("slug", slug)
    .single()

  if (error || !product) return null
  return product
}

export async function generateMetadata(
  { params, searchParams }: PageProps,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const { variant } = await searchParams
  
  const data = await getProduct(slug)
  if (!data) return {}
  
  const title = data.title
  const description = data.description ?? "Handmade product"
  const ogImage = data.product_images?.[0]?.url ?? "/handmade-product.png"
  const url = buildProductShareUrl(slug, { variant })

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: ogImage }],
      type: "website",
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { variant: initialVariantParam = "" } = await searchParams
  
  const product = await getProduct(slug)
  if (!product) notFound()

  const images: { url: string; alt: string }[] = (product.product_images ?? []).map((i: any) => ({
    url: i.url,
    alt: i.alt ?? product.title,
  }))

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          {images.length === 0 && (
            <Image
              src="/handmade-product.png"
              alt={product.title}
              width={600}
              height={500}
              className="w-full rounded-lg border object-cover"
            />
          )}
          {images.map((img, i) => (
            <Image
              key={i}
              src={img.url || "/placeholder.svg?height=500&width=600&query=handmade%20product"}
              alt={img.alt}
              width={600}
              height={500}
              className="w-full rounded-lg border object-cover"
            />
          ))}
        </div>

        <ProductPageWrapper
          product={product}
          images={images}
          initialVariantParam={initialVariantParam}
        />
      </div>
    </main>
  )
}
