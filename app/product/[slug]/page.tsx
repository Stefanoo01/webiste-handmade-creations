import { Metadata, ResolvingMetadata } from "next"
import Image from "next/image"
import ProductImageCarousel from "@/components/product-image-carousel"
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
      <section className="mx-auto max-w-3xl text-center space-y-3 py-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{product.title}</h1>
        {product.description && (
          <p className="text-muted-foreground text-lg">{product.description}</p>
        )}
      </section>

      <section className="mx-auto">
        <div className="aspect-square rounded-2xl border overflow-hidden shadow-sm">
          {images.length > 0 ? (
            <ProductImageCarousel
                images={images.map((i) => i.url)}
                alt={product.title}
              />
          ) : (
            <Image
              src="/handmade-product.png"
              alt={product.title}
              width={400}
              height={400}
              className="w-full object-cover"
            />
          )}
        </div>
      </section>

      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
        <ProductPageWrapper
          product={product}
          images={images}
          initialVariantParam={initialVariantParam}
        />
      </div>
    </main>
  )
}
