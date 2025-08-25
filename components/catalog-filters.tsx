"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { createSupabaseClient } from "@/lib/supabase/client"

type Props = {
  defaultCategorySlug?: string
  defaultQuery?: string
}

export default function CatalogFilters({
  defaultCategorySlug = "all",
  defaultQuery = "",
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  // Always derive current values from the URL
  const category = sp.get("category") ?? "all";
  const subcategory = sp.get("subcategory") ?? "all";
  const qParam = sp.get("q") ?? "";

  // Optional: keep a local input state for q (so typing is smooth),
  // but sync it when the URL changes:
  const [q, setQ] = useState(qParam);
  useEffect(() => setQ(qParam), [qParam]);

  const setParam = (key: string, value?: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value && value !== "all" && value !== "") params.set(key, value);
    else params.delete(key);
    router.push(`/catalog?${params.toString()}`);
  };
  
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; parent_id?: string | null }[]>([])


  useEffect(() => {
    const supabase = createSupabaseClient()
    supabase.from("categories").select("id, name, slug, parent_id").then(({ data }) => setCategories(data ?? []))
  }, [])

  // Group categories by parent/child relationship
  const groupedCategories = useMemo(() => {
    const parentCategories = categories.filter(c => !c.parent_id)
    const subcategories = categories.filter(c => c.parent_id)
    
    return parentCategories.map(parent => ({
      ...parent,
      subcategories: subcategories.filter(sub => sub.parent_id === parent.id)
    }))
  }, [categories])

  const reset = () => {
    setParam("category", "all")
    setParam("subcategory", "all")
    setQ("")
    router.push("/catalog")
  }

  const hasAny = useMemo(() => !!(category || q || subcategory), [category, q, subcategory])

  return (
    <div className="mt-4 flex gap-3 rounded-lg border p-3 items-center">
      <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select value={category} onValueChange={(value) => {
          // Clear subcategory when changing main category
          setParam("subcategory", "all")
          setParam("category", value)
          const params = new URLSearchParams(sp.toString())
          params.set("category", value)
          params.delete("subcategory")
          if (q) params.set("q", q)
          else params.delete("q")
          router.push(`/catalog?${params.toString()}`)
        }}>
          <SelectTrigger className="border-primary">
            <SelectValue placeholder="Categoria principale" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {groupedCategories.map((parent) => (
              <SelectItem key={parent.id} value={parent.slug}>
                {parent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={subcategory} 
          onValueChange={(value) => {
            setParam("subcategory", value)
            const params = new URLSearchParams(sp.toString())
            if (value && value !== "all") params.set("subcategory", value)
            else params.delete("subcategory")
            if (category) params.set("category", category)
            if (q) params.set("q", q)
            router.push(`/catalog?${params.toString()}`)
          }}
          disabled={category === "all"}
        >
          <SelectTrigger className="border-primary">
            <SelectValue placeholder="Sottocategoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le sottocategorie</SelectItem>
            {category !== "all" && groupedCategories.find(c => c.slug === category)?.subcategories.map((sub) => (
              <SelectItem key={sub.id} value={sub.slug}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>



        <div className="relative sm:col-span-1">
          <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              const params = new URLSearchParams(sp.toString())
              if (category) params.set("category", category)
              else params.delete("category")
              params.set("q", e.target.value)
              router.push(`/catalog?${params.toString()}`)
            }}
            placeholder="Cerca per nome o categoria..."
            className="pl-8 border-primary"
            aria-label="Cerca per nome"
          />
        </div>
      </div>
      <Button size="sm" onClick={reset} disabled={!hasAny}>
        Resetta
      </Button>
    </div>
  )
}
