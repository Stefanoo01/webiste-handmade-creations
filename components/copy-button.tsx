"use client"

import { PropsWithChildren } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Props = PropsWithChildren<{
  text: string
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "primary"
  ariaLabel?: string
}>

export default function CopyButton({ text, variant = "primary", ariaLabel = "Copy to clipboard", children }: Props) {
  const { toast } = useToast()
  return (
    <Button
      variant={variant}
      size="sm"
      aria-label={ariaLabel}
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        toast({ title: "Copied to clipboard" })
      }}
    >
      {children ?? "Copy"}
    </Button>
  )
}
