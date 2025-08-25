"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createSupabaseClient } from "@/lib/supabase/client"

type Category = { id: string; name: string; slug: string; description: string | null; parent_id?: string | null }

export default function CategoriesForm() {
  const [items, setItems] = useState<Category[]>([])
  const [draft, setDraft] = useState({ name: "", slug: "", description: "", parent_id: "none" })
  const { toast } = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const refresh = async () => {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("categories").select("*").order("name")
    if (!error) setItems(data ?? [])
  }

  // Get only parent categories (categories without parent_id)
  const getParentCategories = () => {
    return items.filter(item => !item.parent_id && item.id !== selectedId)
  }

  useEffect(() => {
    refresh()
  }, [])

  const add = async () => {
    const supabase = createSupabaseClient()
    const insertData = {
      ...draft,
      parent_id: draft.parent_id === "none" ? null : draft.parent_id || null
    }
    const { error } = await supabase.from("categories").insert(insertData)
    if (error) return toast({ title: "Errore", description: error.message, variant: "destructive" })
    setDraft({ name: "", slug: "", description: "", parent_id: "" })
    toast({ title: "Salvato" })
    refresh()
  }

  const remove = async (id: string) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) return toast({ title: "Errore", description: error.message, variant: "destructive" })
    toast({ title: "Eliminato" })
    refresh()
  }

  const loadForEdit = async (id: string) => {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, parent_id")
      .eq("id", id)
      .single()
    if (error || !data) {
      toast({ title: "Errore", description: error?.message, variant: "destructive" })
      return
    }
    setDraft({
      name: data.name ?? "",
      slug: data.slug ?? "",
      description: data.description ?? "",
      parent_id: data.parent_id ?? "none",
    })
  }

  const update = async () => {
    if (!selectedId) return
    const supabase = createSupabaseClient()
    const updateData = {
      name: draft.name,
      slug: draft.slug,
      description: draft.description,
      parent_id: draft.parent_id === "none" ? null : draft.parent_id || null
    }
    const { error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", selectedId)
    if (error) return toast({ title: "Errore", description: error.message, variant: "destructive" })
    toast({ title: "Modifiche salvate" })
    await refresh()
  }

  const deselect = () => {
    setSelectedId(null)
    setDraft({ name: "", slug: "", description: "", parent_id: "none" })
  }

  const toggleSelect = async (c: Category) => {
    if (selectedId === c.id) {
      deselect()
      return
    }
    setSelectedId(c.id)
    await loadForEdit(c.id)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{selectedId ? "Modifica categoria" : "Aggiungi categoria"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input placeholder="Nome" value={draft.name} onChange={(e) => setDraft((s) => ({ ...s, name: e.target.value }))} />
          <Input placeholder="Identificativo univoco" value={draft.slug} onChange={(e) => setDraft((s) => ({ ...s, slug: e.target.value }))} />
          
          <Select value={draft.parent_id || "none"} onValueChange={(value) => setDraft((s) => ({ ...s, parent_id: value === "none" ? "" : value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona categoria padre (opzionale)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nessuna</SelectItem>
              {getParentCategories().map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Textarea
            placeholder="Descrizione"
            value={draft.description}
            onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
          />
          {selectedId ? (
            <div className="flex items-center gap-2">
              <Button onClick={update}>
                <Plus className="mr-2 h-4 w-4" />
                Salva modifiche
              </Button>
              <Button variant="primary" onClick={deselect}>Annulla</Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={add}>
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 && <div className="text-sm text-muted-foreground">Ancora nessuna categoria.</div>}
          {items.map((c) => {
            const parentCategory = items.find(item => item.id === c.parent_id)
            return (
              <div
                key={c.id}
                onClick={() => toggleSelect(c)}
                className={`flex cursor-pointer items-center justify-between rounded-md border p-2 transition-colors ${
                  selectedId === c.id ? "bg-foreground text-background" : "hover:bg-foreground hover:text-background"
                }`}
              >
                <div>
                  <div className="font-medium">
                    {c.name}
                    {parentCategory && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        → {parentCategory.name}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs text-muted-foreground transition-lors ${selectedId === c.id ? "text-muted-foreground" : "text-muted"}`}>
                    {c.slug}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); remove(c.id) }}
                  aria-label={`Delete ${c.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
