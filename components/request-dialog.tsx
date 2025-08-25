"use client"

import { useState } from "react"
import { Loader2, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createSupabaseClient } from "@/lib/supabase/client"

type Props = {
  productId?: string
  productTitle?: string
  defaultVariantParam?: string
}

export default function RequestDialog({
  productId = "",
  productTitle = "Product",
  defaultVariantParam = "",
}: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")

  const onSubmit = async () => {
    setSubmitting(true)
    try {
      const selected_variants = variantParamToJson(defaultVariantParam)
      const supabase = createSupabaseClient()
      const { error } = await supabase.from("requests").insert({
        product_id: productId,
        selected_material: null, // look up by slug in backend if needed
        selected_variants,
        user_name: name,
        user_email: email,
        notes,
      })
      if (error) throw error
      toast({ title: "Request sent", description: "We will get back to you soon!" })
      console.log("Request", {
        product_id: productId,
        productTitle,

        selected_variants,
        name,
        email,
        notes,
      })
      setOpen(false)
      setName("")
      setEmail("")
      setNotes("")
    } catch (e: any) {
      toast({ title: "Failed to send request", description: e?.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Send request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request customization</DialogTitle>
          <DialogDescription>Send a request for “{productTitle}”. We&apos;ll reply via email.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border p-3 text-sm">
            <div>
              <span className="font-medium">Product:</span> {productTitle}
            </div>

            {defaultVariantParam && (
              <div>
                <span className="font-medium">Variants:</span> {defaultVariantParam}
              </div>
            )}
          </div>
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            placeholder="Your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Textarea
            placeholder="Notes (colors, preferences, deadline...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function variantParamToJson(variantParam: string) {
  const obj: Record<string, string> = {}
  if (!variantParam) return obj
  variantParam.split(",").forEach((pair) => {
    const [name, val] = pair.split(":")
    if (name && val) obj[name] = val
  })
  return obj
}
