"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, ImageIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"

type Category = { id: string; name: string; parent_id?: string | null }

type Product = { id: string; title: string; slug: string; description: string | null; base_price: number | null; category_id: string | null }

export default function ProductsForm() {
  const supabase = useMemo(() => createSupabaseClient(), [])
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])

  const [products, setProducts] = useState<Product[]>([])
  const [draft, setDraft] = useState<Product>({ id: "", title: "", slug: "", description: "", base_price: null, category_id: null })
  const [draftImages, setDraftImages] = useState<{ file: File | null; alt: string }[]>([])
  const [draftOptions, setDraftOptions] = useState<
    { 
      id?: string; 
      name: string; 
      option_type: "option_list" | "option_list_multi" | "character" | "input_text" | "image_input" | "image_option_list" | "checkbox"; 
      is_mandatory: boolean;
      placeholder?: string;
      validation_rules?: { min_length?: number; max_length?: number };
      values: { value: string; image_url?: string; file?: File | null; price_delta?: number | null }[] 
    }[]
  >([])

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const refresh = async () => {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from("categories").select("id, name, parent_id"),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
    ])
    setCategories(cats ?? [])
    setProducts(prods ?? [])
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .insert({
        title: draft.title,
        slug: draft.slug,
        description: draft.description,
        base_price: draft.base_price,
        category_id: draft.category_id,
      })
      .select("*")
      .single()
    if (error || !data) {
      toast({ title: "Errore nel salvataggio del prodotto", description: error?.message, variant: "destructive" })
      return
    }

    // images: upload to Supabase Storage then save URLs
    for (const img of draftImages) {
      if (!img.file) continue
      const file = img.file
      const ext = file.name.split('.').pop() || 'jpg'
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const path = `products/${data.id}/${unique}.${ext}`
      // eslint-disable-next-line no-await-in-loop
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
      if (uploadError) {
        // continue but notify
        toast({ title: "Errore nel caricamento dell'immagine", description: uploadError.message, variant: "destructive" })
        console.error(uploadError)
        continue
      }
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path)
      // eslint-disable-next-line no-await-in-loop
      await supabase.from("product_images").insert({ product_id: data.id, url: pub.publicUrl, alt: img.alt })
    }

    // options and values
    for (const opt of draftOptions) {
      // eslint-disable-next-line no-await-in-loop
      const { data: odata, error: oerr } = await supabase
        .from("product_options")
        .insert({ 
          product_id: data.id, 
          name: opt.name, 
          option_type: opt.option_type,
          is_mandatory: opt.is_mandatory,
          placeholder: opt.placeholder,
          validation_rules: opt.validation_rules
        })
        .select("id")
        .single()
      if (oerr || !odata) continue
      
      // Only add values for options that need them
      if (opt.option_type !== 'character' && opt.option_type !== 'input_text' && opt.option_type !== 'image_input') {
        for (const val of opt.values) {
          let valueImageUrl: string | null = val.image_url ?? null
          if (val.file) {
            const file = val.file
            const ext = file.name.split('.').pop() || 'jpg'
            const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
            const path = `products/${data.id}/options/${odata.id}/${unique}.${ext}`
            // eslint-disable-next-line no-await-in-loop
            const { error: vUploadError } = await supabase.storage
              .from('product-images')
              .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
            if (vUploadError) {
              toast({ title: "Errore nel caricamento dell'immagine", description: vUploadError.message, variant: "destructive" })
              console.error(vUploadError)
            } else {
              const { data: vpub } = supabase.storage.from('product-images').getPublicUrl(path)
              valueImageUrl = vpub.publicUrl
            }
          }
          // eslint-disable-next-line no-await-in-loop
          await supabase
            .from("product_option_values")
            .insert({ option_id: odata.id, value: val.value, image_url: valueImageUrl, price_delta: val.price_delta ?? null })
        }
      }
    }

    toast({ title: "Prodotto creato" })
    setDraft({ id: "", title: "", slug: "", description: "", base_price: null, category_id: null })
    setDraftImages([])
    setDraftOptions([])

    refresh()
  }

  const loadProductForEdit = async (id: string) => {
    // load base product
    const { data: prod, error: prodErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
    if (prodErr || !prod) {
      toast({ title: "Errore nel caricamento del prodotto", description: prodErr?.message, variant: "destructive" })
      return
    }

    // load options and values
    const { data: optionsData } = await supabase
      .from("product_options")
      .select("id, name, option_type, is_mandatory, placeholder, validation_rules, product_option_values ( value, image_url, price_delta )")
      .eq("product_id", id)

    setDraft({
      id: prod.id,
      title: prod.title ?? "",
      slug: prod.slug ?? "",
      description: prod.description ?? "",
      base_price: prod.base_price,
      category_id: prod.category_id,
    })

    setDraftImages([]) // existing images are not loaded into file inputs
    setDraftOptions(
      (optionsData ?? []).map((opt: any) => ({
        id: opt.id,
        name: opt.name ?? "",
        option_type: opt.option_type || 'option_list',
        is_mandatory: opt.is_mandatory ?? false,
        placeholder: opt.placeholder,
        validation_rules: opt.validation_rules,
        values: (opt.product_option_values ?? []).map((v: any) => ({
          value: v.value ?? "",
          image_url: v.image_url ?? undefined,
          file: null,
          price_delta: v.price_delta ?? null,
        })),
      }))
    )
  }

  const updateProduct = async () => {
    if (!selectedProductId) return

    const { error: updErr } = await supabase
      .from("products")
      .update({
        title: draft.title,
        slug: draft.slug,
        description: draft.description,
        base_price: draft.base_price,
        category_id: draft.category_id,
      })
      .eq("id", selectedProductId)
    if (updErr) {
      toast({ title: "Errore nel salvataggio del prodotto", description: updErr.message, variant: "destructive" })
      return
    }

    // replace options and values
    await supabase.from("product_options").delete().eq("product_id", selectedProductId)
    for (const opt of draftOptions) {
      // eslint-disable-next-line no-await-in-loop
      const { data: odata, error: oerr } = await supabase
        .from("product_options")
        .insert({ 
          product_id: selectedProductId, 
          name: opt.name, 
          option_type: opt.option_type,
          is_mandatory: opt.is_mandatory,
          placeholder: opt.placeholder,
          validation_rules: opt.validation_rules
        })
        .select("id")
        .single()
      if (oerr || !odata) continue
      
      // Only add values for options that need them
      if (opt.option_type !== 'character' && opt.option_type !== 'input_text' && opt.option_type !== 'image_input') {
        for (const val of opt.values) {
          let valueImageUrl: string | null = val.image_url ?? null
          if (val.file) {
            const file = val.file
            const ext = file.name.split('.').pop() || 'jpg'
            const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
            const path = `products/${selectedProductId}/options/${odata.id}/${unique}.${ext}`
            // eslint-disable-next-line no-await-in-loop
            const { error: vUploadError } = await supabase.storage
              .from('product-images')
              .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
            if (!vUploadError) {
              const { data: vpub } = supabase.storage.from('product-images').getPublicUrl(path)
              valueImageUrl = vpub.publicUrl
            }
          }
          // eslint-disable-next-line no-await-in-loop
          await supabase
            .from("product_option_values")
            .insert({ option_id: odata.id, value: val.value, image_url: valueImageUrl, price_delta: val.price_delta ?? null })
        }
      }
    }

    // upload any newly added images (appended)
    for (const img of draftImages) {
      if (!img.file) continue
      const file = img.file
      const ext = file.name.split('.').pop() || 'jpg'
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const path = `products/${selectedProductId}/${unique}.${ext}`
      // eslint-disable-next-line no-await-in-loop
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
      if (!uploadError) {
        const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path)
        // eslint-disable-next-line no-await-in-loop
        await supabase.from("product_images").insert({ product_id: selectedProductId, url: pub.publicUrl, alt: img.alt })
      }
    }

    toast({ title: "Prodotto aggiornato" })
    await refresh()
  }

  const toggleSelectProduct = async (p: Product) => {
    if (selectedProductId === p.id) {
      // deselect -> reset to new draft
      setSelectedProductId(null)
      setDraft({ id: "", title: "", slug: "", description: "", base_price: null, category_id: null })
      setDraftImages([])
      setDraftOptions([])
  
      return
    }
    setSelectedProductId(p.id)
    await loadProductForEdit(p.id)
  }

  const deleteProduct = async (id: string) => {
    // First, get all images associated with this product
    const { data: images } = await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", id)
    
    // Delete images from Supabase Storage
    if (images && images.length > 0) {
      for (const img of images) {
        // Extract path from URL (remove domain part)
        const url = new URL(img.url)
        const path = url.pathname.split('/').slice(6).join('/') // Remove /storage/v1/object/public/product-images/
        
        if (path) {
          // eslint-disable-next-line no-await-in-loop
          await supabase.storage
            .from('product-images')
            .remove([path])
        }
      }
    }

    // Delete from database (cascade will handle product_images, product_options, etc.)
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) return toast({ title: "Errore nell'eliminazione", description: error.message, variant: "destructive" })
    
    toast({ title: "Prodotto eliminato" })
    refresh()
  }

  const addOption = () => {
    setDraftOptions((arr) => [...arr, { 
      name: "", 
      option_type: "option_list", 
      is_mandatory: false,
      values: [] 
    }])
  }

  const updateOption = (index: number, field: string, value: any) => {
    setDraftOptions((arr) => {
      const next = [...arr]
      const option = next[index]
      next[index] = { ...option, [field]: value }
      return next
    })
  }

  const addOptionValue = (optionIndex: number) => {
    setDraftOptions((arr) => {
      const next = [...arr]
      const option = next[optionIndex]
      const updatedValues = [...option.values, { value: "", image_url: "", file: null, price_delta: null }]
      next[optionIndex] = { ...option, values: updatedValues }
      return next
    })
  }

  const updateOptionValue = (optionIndex: number, valueIndex: number, field: string, value: any) => {
    setDraftOptions((arr) => {
      const next = [...arr]
      const option = next[optionIndex]
      const updatedValues = option.values.map((v, i) =>
        i === valueIndex ? { ...v, [field]: value } : v
      )
      next[optionIndex] = { ...option, values: updatedValues }
      return next
    })
  }

  const removeOption = (index: number) => {
    setDraftOptions((arr) => arr.filter((_, i) => i !== index))
  }

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    setDraftOptions((arr) => {
      const next = [...arr]
      const option = next[optionIndex]
      const updatedValues = option.values.filter((_, i) => i !== valueIndex)
      next[optionIndex] = { ...option, values: updatedValues }
      return next
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{selectedProductId ? "Modifica prodotto" : "Aggiungi prodotto"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="text-sm font-medium">Titolo</div>
          <Input placeholder="Titolo" value={draft.title} onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))} />
          <div className="text-sm font-medium">Identificativo univoco</div>
          <Input placeholder="Identificativo univoco" value={draft.slug} onChange={(e) => setDraft((s) => ({ ...s, slug: e.target.value }))} />
          <div className="text-sm font-medium">Descrizione</div>
          <Textarea
            placeholder="Descrizione"
            value={draft.description ?? ""}
            onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
          />
          <div className="text-sm font-medium">Prezzo base</div>
          <Input
            placeholder="Prezzo base"
            type="number"
            value={draft.base_price ?? ""}
            onChange={(e) => setDraft((s) => ({ ...s, base_price: e.target.value ? Number(e.target.value) : null }))}
          />
          <div className="text-sm font-medium">Categoria</div>
          <Select value={draft.category_id ?? ""} onValueChange={(v) => setDraft((s) => ({ ...s, category_id: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nessuna categoria</SelectItem>
              {categories
                .filter(c => !c.parent_id) // Show only parent categories
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              {categories
                .filter(c => c.parent_id) // Show subcategories with indentation
                .map((c) => {
                  const parent = categories.find(p => p.id === c.parent_id)
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      └ {c.name} {parent && `(${parent.name})`}
                    </SelectItem>
                  )
                })}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <div className="text-sm font-medium">Immagini</div>
            <div className="space-y-2">
              {draftImages.map((img, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setDraftImages((arr) => {
                        const next = [...arr]
                        next[i] = { ...next[i], file: e.target.files?.[0] ?? null }
                        return next
                      })
                    }
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDraftImages((arr) => arr.filter((_, idx) => idx !== i))}
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="primary" size="sm" onClick={() => setDraftImages((arr) => [...arr, { file: null, alt: "" }])}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Aggiungi immagine
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Opzioni & Valori</div>
            <div className="space-y-3">
              {draftOptions.map((opt, idx) => (
                <div key={idx} className="rounded-md border p-3">
                  <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                    <Input
                      placeholder="Nome opzione (e.g., colore)"
                      value={opt.name}
                      onChange={(e) => updateOption(idx, 'name', e.target.value)}
                    />
                    <Select
                      value={opt.option_type}
                      onValueChange={(v: any) => updateOption(idx, 'option_type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option_list">Lista opzioni (singola)</SelectItem>
                        <SelectItem value="option_list_multi">Lista opzioni (multipla)</SelectItem>
                        <SelectItem value="character">Carattere alfabetico</SelectItem>
                        <SelectItem value="input_text">Input testo</SelectItem>
                        <SelectItem value="image_input">Input immagine</SelectItem>
                        <SelectItem value="image_option_list">Lista opzioni immagini</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeOption(idx)}
                      aria-label="Remove option"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
      
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`mandatory-${idx}`}
                        checked={opt.is_mandatory}
                        onCheckedChange={(checked) => updateOption(idx, 'is_mandatory', checked)}
                      />
                      <Label htmlFor={`mandatory-${idx}`}>Obbligatorio</Label>
                    </div>
                    
                    {opt.option_type === 'input_text' && (
                      <Input
                        placeholder="Placeholder (opzionale)"
                        value={opt.placeholder || ''}
                        onChange={(e) => updateOption(idx, 'placeholder', e.target.value)}
                        className="max-w-xs"
                      />
                    )}
                    
                    {opt.option_type === 'input_text' && (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Min caratteri"
                          type="number"
                          value={opt.validation_rules?.min_length || ''}
                          onChange={(e) => {
                            const current = opt.validation_rules || {}
                            updateOption(idx, 'validation_rules', {
                              ...current,
                              min_length: e.target.value ? Number(e.target.value) : undefined
                            })
                          }}
                          className="w-20"
                        />
                        <Input
                          placeholder="Max caratteri"
                          type="number"
                          value={opt.validation_rules?.max_length || ''}
                          onChange={(e) => {
                            const current = opt.validation_rules || {}
                            updateOption(idx, 'validation_rules', {
                              ...current,
                              max_length: e.target.value ? Number(e.target.value) : undefined
                            })
                          }}
                          className="w-20"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Only show values for options that need them */}
                  {(opt.option_type === 'option_list' || opt.option_type === 'option_list_multi' || opt.option_type === 'image_option_list') && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium">Valori opzione:</div>
                      {opt.values.map((val, vIdx) => (
                        <div key={vIdx} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                          <Input
                            placeholder="Valore (e.g., verde)"
                            value={val.value}
                            onChange={(e) => updateOptionValue(idx, vIdx, 'value', e.target.value)}
                          />
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => updateOptionValue(idx, vIdx, 'file', e.target.files?.[0] ?? null)}
                          />
                          <Input
                            placeholder="Cambio prezzo"
                            type="number"
                            value={val.price_delta ?? ""}
                            onChange={(e) => updateOptionValue(idx, vIdx, 'price_delta', e.target.value ? Number(e.target.value) : null)}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeOptionValue(idx, vIdx)}
                            aria-label="Remove value"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => addOptionValue(idx)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Aggiungi valore
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button variant="primary" size="sm" onClick={addOption}>
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi opzione
            </Button>
          </div>

          {selectedProductId ? (
            <div className="flex items-center gap-2">
              <Button onClick={updateProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Salva modifiche
              </Button>
              <Button variant="primary" onClick={() => toggleSelectProduct({ id: selectedProductId, title: "", slug: "", description: "", base_price: null, category_id: null })}>
                Annulla
              </Button>
            </div>
          ) : (
            <Button onClick={addProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Crea prodotto
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prodotti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {products.length === 0 && <div className="text-sm text-muted-foreground">Ancora nessun prodotto.</div>}
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => toggleSelectProduct(p)}
              className={`flex cursor-pointer items-center justify-between rounded-md border p-2 transition-colors ${
                selectedProductId === p.id ? "bg-foreground text-background" : "hover:bg-foreground hover:text-background"
              }`}
            >
              <div>
                <div className="font-medium">{p.title}</div>
                <div className={`text-xs text-muted-foreground transition-lors ${selectedProductId === p.id ? "text-muted-foreground" : "text-muted"}`}>{p.slug}</div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => { e.stopPropagation(); deleteProduct(p.id) }}
                aria-label={`Delete ${p.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
