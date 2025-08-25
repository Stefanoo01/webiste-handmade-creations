"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ImageIcon, Trash2 } from "lucide-react"

export default function ConfigForm() {
  const [values, setValues] = useState({
    email: "",
    phone: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    about_title: "",
    about_description: "",
    about_image_url: "",
  })
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createSupabaseClient()
    supabase
      .from("config")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setValues({
            email: data.email ?? "",
            phone: data.phone ?? "",
            instagram: data.instagram ?? "",
            facebook: data.facebook ?? "",
            tiktok: data.tiktok ?? "",
            about_title: data.about_title ?? "",
            about_description: data.about_description ?? "",
            about_image_url: data.about_image_url ?? "",
          })
        }
        setLoading(false)
      })
  }, [])

  const save = async () => {
    setSaving(true)
    const supabase = createSupabaseClient()
    
    try {
      const url = new URL(values.about_image_url)
        const oldPath = url?.pathname?.split('/').slice(6).join('/')
      console.log(oldPath);
      if (oldPath) {
        // eslint-disable-next-line no-await-in-loop
        await supabase.storage
          .from('product-images')
          .remove([oldPath])
      }
      // If there's a new image file, upload it first
      let imageUrl = values.about_image_url
      if (aboutImageFile) {
        const ext = aboutImageFile.name.split('.').pop() || 'jpg'
        const path = `config/about-image.${ext}`
        
        const { error: uploadError } = await supabase.storage
          .from('product-images') // Using the same bucket as products
          .upload(path, aboutImageFile, { 
            cacheControl: '3600', 
            upsert: true, // Overwrite existing about image
            contentType: aboutImageFile.type 
          })
        
        if (uploadError) {
          toast({ 
            title: "Errore nel caricamento dell'immagine", 
            description: uploadError.message, 
            variant: "destructive" 
          })
          setSaving(false)
          return
        }
        
        const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path)
        imageUrl = pub.publicUrl
      }

      // Save config with the new image URL
      const { error } = await supabase
        .from("config")
        .upsert({ 
          id: 1, 
          ...values, 
          about_image_url: imageUrl 
        })
      
      if (error) {
        toast({ 
          title: "Errore nel salvataggio", 
          description: error.message, 
          variant: "destructive" 
        })
      } else {
        toast({ title: "Salvato" })
        // Update local state with new image URL
        setValues(prev => ({ ...prev, about_image_url: imageUrl }))
        setAboutImageFile(null) // Clear the file input
      }
    } catch (error) {
      toast({ 
        title: "Errore", 
        description: "Si è verificato un errore imprevisto", 
        variant: "destructive" 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Chi sono section */}
      <Card className="gap-2">
        <CardHeader>
          <CardTitle>Chi sono</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1">
        <div className="text-sm font-medium">Descrizione</div>
          <textarea
            placeholder="Descrizione"
            value={values.about_description}
            onChange={(e) => setValues((s) => ({ ...s, about_description: e.target.value }))}
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          
          {/* Image upload section */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Immagine profilo</div>
            
            {/* Current image preview */}
            {values.about_image_url && (
              <div className="relative inline-block">
                <img 
                  src={values.about_image_url} 
                  alt="Immagine profilo attuale" 
                  className="h-24 w-24 object-cover rounded-md border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={() => setValues(prev => ({ ...prev, about_image_url: "" }))}
                  aria-label="Rimuovi immagine"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {/* File input */}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAboutImageFile(e.target.files?.[0] ?? null)}
                className="flex-1"
              />
              {aboutImageFile && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setAboutImageFile(null)}
                  aria-label="Rimuovi file selezionato"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Upload button */}
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => {
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                fileInput?.click()
              }}
              className="w-full"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              {aboutImageFile ? 'Cambia immagine' : 'Seleziona immagine'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contatti e social section */}
      <Card className="gap-2">
        <CardHeader>
          <CardTitle>Contatti e social</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Email</div>
              <Input
                placeholder="Email"
                value={values.email}
                onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div>
              <div className="text-sm font-medium">Numero di telefono</div>
              <Input
                placeholder="Numero di telefono"
                value={values.phone}
                onChange={(e) => setValues((s) => ({ ...s, phone: e.target.value }))}
              />
            </div>
            <div>
              <div className="text-sm font-medium">Instagram URL</div>
              <Input
                placeholder="Instagram URL"
                value={values.instagram}
                onChange={(e) => setValues((s) => ({ ...s, instagram: e.target.value }))}
              />
            </div>
            <div>
              <div className="text-sm font-medium">Facebook URL</div>
              <Input
                placeholder="Facebook URL"
                value={values.facebook}
                onChange={(e) => setValues((s) => ({ ...s, facebook: e.target.value }))}
              />
            </div>
            <div>
              <div className="text-sm font-medium">TikTok URL</div>
              <Input
                placeholder="TikTok URL"
                value={values.tiktok}
                onChange={(e) => setValues((s) => ({ ...s, tiktok: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} className="w-full" disabled={saving}>
        {saving ? "Salvando..." : "Salva tutto"}
      </Button>
    </div>
  )
}
