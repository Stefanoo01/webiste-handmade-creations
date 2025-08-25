"use client"

import { Share2, Link2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Props = {
  url?: string
  title?: string
}

export default function ShareButtons({ url = "", title = "Check this out" }: Props) {
  const { toast } = useToast()

  const share = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, url })
      } catch (e) {
        // ignore cancel
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast({ title: "Link copiato" })
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="primary" onClick={share}>
        <Share2 className="mr-2 h-4 w-4" />
        Condividi
      </Button>
      <Button
        variant="primary"
        onClick={async () => {
          await navigator.clipboard.writeText(url)
          toast({ title: "Link copiato" })
        }}
      >
        <Link2 className="mr-2 h-4 w-4" />
        Copia link
      </Button>
    </div>
  )
}
