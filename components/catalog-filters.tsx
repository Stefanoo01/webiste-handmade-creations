"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, RotateCcw } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { createSupabaseClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

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
  const minPrice = sp.get("minPrice") ?? "";
  const maxPrice = sp.get("maxPrice") ?? "";
  const sortBy = sp.get("sortBy") ?? "";
  const sortOrder = sp.get("sortOrder") ?? "asc";

  // Optional: keep a local input state for q (so typing is smooth),
  // but sync it when the URL changes:
  const [q, setQ] = useState(qParam);
  const [minPriceLocal, setMinPriceLocal] = useState(minPrice);
  const [maxPriceLocal, setMaxPriceLocal] = useState(maxPrice);
  
  useEffect(() => setQ(qParam), [qParam]);
  useEffect(() => setMinPriceLocal(minPrice), [minPrice]);
  useEffect(() => setMaxPriceLocal(maxPrice), [maxPrice]);

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
    setParam("minPrice", "")
    setParam("maxPrice", "")
    setParam("sortBy", "")
    setParam("sortOrder", "")
    setQ("")
    setMinPriceLocal("")
    setMaxPriceLocal("")
    router.push("/catalog")
  }

  const handleSort = (field: string) => {
    const params = new URLSearchParams(sp.toString());
    const currentSortBy = params.get("sortBy");
    const currentSortOrder = params.get("sortOrder");
    
    if (currentSortBy === field) {
      // Toggle order if same field
      const newOrder = currentSortOrder === "asc" ? "desc" : "asc";
      params.set("sortOrder", newOrder);
    } else {
      // Set new field with ascending order
      params.set("sortBy", field);
      params.set("sortOrder", "asc");
    }
    
    router.push(`/catalog?${params.toString()}`);
  };

  const getSortIcon = (field: string) => {
    const currentSortBy = sp.get("sortBy");
    const currentSortOrder = sp.get("sortOrder");
    
    if (currentSortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return currentSortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Main Filters */}
      <div className="grid gap-4 p-6 bg-card rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtri e Ricerca</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Categoria principale</label>
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
              <SelectTrigger className="border-primary/50 hover:border-primary transition-colors">
                <SelectValue placeholder="Seleziona categoria" />
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Sottocategoria</label>
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
              <SelectTrigger className={cn(
                "border-primary/50 hover:border-primary transition-colors",
                category === "all" && "opacity-50 cursor-not-allowed"
              )}>
                <SelectValue placeholder="Seleziona sottocategoria" />
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Ricerca</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                placeholder="Cerca prodotti..."
                className="pl-10 border-primary/50 hover:border-primary transition-colors"
                aria-label="Cerca per nome"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Prezzo</label>
            <div className="flex gap-2">
              <Input
                value={minPriceLocal}
                onChange={(e) => {
                  setMinPriceLocal(e.target.value)
                  const params = new URLSearchParams(sp.toString())
                  if (e.target.value) params.set("minPrice", e.target.value)
                  else params.delete("minPrice")
                  router.push(`/catalog?${params.toString()}`)
                }}
                placeholder="Min"
                type="number"
                min="0"
                step="0.01"
                className="w-full border-primary/50 hover:border-primary transition-colors"
              />
              <Input
                value={maxPriceLocal}
                onChange={(e) => {
                  setMaxPriceLocal(e.target.value)
                  const params = new URLSearchParams(sp.toString())
                  if (e.target.value) params.set("maxPrice", e.target.value)
                  else params.delete("maxPrice")
                  router.push(`/catalog?${params.toString()}`)
                }}
                placeholder="Max"
                type="number"
                min="0"
                step="0.01"
                className="w-full border-primary/50 hover:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={reset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Resetta filtri
          </Button>
        </div>
      </div>

      {/* Sorting Options */}
      <div className="p-4 bg-background rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Ordina per:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSort("title")}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              sortBy === "title" && "bg-primary text-primary-foreground border-primary shadow-md"
            )}
          >
            Nome {getSortIcon("title")}
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSort("base_price")}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              sortBy === "base_price" && "bg-primary text-primary-foreground border-primary shadow-md"
            )}
          >
            Prezzo {getSortIcon("base_price")}
          </Button>
        </div>
      </div>
    </div>
  )
}
