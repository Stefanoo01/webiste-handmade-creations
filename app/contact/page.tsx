import { Mail, Phone } from 'lucide-react'
import Instagram from "@/components/ui/svg/instagram";
import Facebook from "@/components/ui/svg/facebook";
import TikTok from "@/components/ui/svg/tiktok";
import Link from "next/link"
import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import ShareButtons from "@/components/share-buttons"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import ContactForm from "./ContactForm"

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach out for custom requests, questions, or collaborations.",
}

async function getConfig() {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.from("config").select("*").eq("id", 1).maybeSingle()
  return data ?? {}
}

export default async function ContactPage() {
  const config = await getConfig()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Chi sono section */}
      {(config.about_title || config.about_description || config.about_image_url) && (
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Description */}
            <div className="space-y-4">
              {config.about_title && (
                <h2 className="text-2xl font-bold text-foreground">
                  {config.about_title}
                </h2>
              )}
              {config.about_description && (
                <p className="text-muted-foreground leading-relaxed">
                  {config.about_description}
                </p>
              )}
            </div>
            
            {/* Right side - Image */}
            {config.about_image_url && (
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-60 h-60 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={config.about_image_url}
                    alt="Chi sono"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact section */}
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold">Contatti</h1>
        <p className="mt-2 text-muted-foreground">
          Inviami un messaggio o seguimi sui social per non perdere i nuovi prodotti.
        </p>

        <div className="mt-6 space-y-3">
          {config.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${config.email}`} className="hover:underline">
                {config.email}
              </a>
            </div>
          )}
          {config.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href={`tel:${config.phone}`} className="hover:underline">
                {config.phone}
              </a>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
          {config.facebook && (
              <Button asChild variant="primary" size="sm">
                <Link href={config.facebook} target="_blank" rel="noreferrer">
                  <Facebook/>
                  Facebook
                </Link>
              </Button>
            )}
            {config.instagram && (
              <Button asChild variant="primary" size="sm">
                <Link href={config.instagram} target="_blank" rel="noreferrer">
                  <Instagram/>
                  Instagram
                </Link>
              </Button>
            )}
            {config.tiktok && (
              <Button asChild variant="primary" size="sm">
                <Link href={config.tiktok} target="_blank" rel="noreferrer">
                  <TikTok/>
                  TikTok
                </Link>
              </Button>
            )}
          <div className="ml-auto">
          <ShareButtons url={`${(process as any).env?.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}`} title={"IlLabirintoDiRiri"} />
          </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </main>
  )
}
