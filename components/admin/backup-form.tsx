"use client"

import { useState } from "react"
import { Upload, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function BackupForm() {
  const [json, setJson] = useState("")
  const { toast } = useToast()

  const exportAll = async () => {
    const supabase = createSupabaseClient()
    const [categories, products, product_images, product_options, product_option_values, config] =
      await Promise.all([
        supabase.from("categories").select("*"),
        supabase.from("products").select("*"),
        supabase.from("product_images").select("*"),
        supabase.from("product_options").select("*"),
        supabase.from("product_option_values").select("*"),
        supabase.from("config").select("*"),
      ])
    const payload = {
      categories: categories.data ?? [],
      products: products.data ?? [],
      product_images: product_images.data ?? [],
      product_options: product_options.data ?? [],
      product_option_values: product_option_values.data ?? [],
      config: config.data ?? [],
    }
    const text = JSON.stringify(payload, null, 2)
    setJson(text)
    const blob = new Blob([text], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "backup.json"
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exported" })
  }

  const importAll = async () => {
    try {
      const data = JSON.parse(json)
      const supabase = createSupabaseClient()

      // Simple approach: upsert each table (assumes UUIDs provided in payload).
      const tasks: Promise<any>[] = []
      if (Array.isArray(data.categories)) tasks.push(supabase.from("categories").upsert(data.categories))

      if (Array.isArray(data.products)) tasks.push(supabase.from("products").upsert(data.products))
      if (Array.isArray(data.product_images)) tasks.push(supabase.from("product_images").upsert(data.product_images))
      if (Array.isArray(data.product_options)) tasks.push(supabase.from("product_options").upsert(data.product_options))
      if (Array.isArray(data.product_option_values))
        tasks.push(supabase.from("product_option_values").upsert(data.product_option_values))

      if (Array.isArray(data.config)) tasks.push(supabase.from("config").upsert(data.config))

      const results = await Promise.all(tasks)
      const err = results.find((r) => r.error)
      if (err?.error) throw new Error(err.error.message)

      toast({ title: "Import completed" })
    } catch (e: any) {
      toast({ title: "Import failed", description: e?.message ?? "Invalid JSON", variant: "destructive" })
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <Button onClick={exportAll}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
        <Button variant="outline" onClick={importAll}>
          <Upload className="mr-2 h-4 w-4" />
          Import JSON
        </Button>
      </div>
      <Textarea
        className="min-h-[240px]"
        placeholder="Paste backup JSON here to import"
        value={json}
        onChange={(e) => setJson(e.target.value)}
      />
    </div>
  )
}
