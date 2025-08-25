"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import ConfigForm from "./config-form"
import CategoriesForm from "./categories-form"

import ProductsForm from "./products-form"
import BackupForm from "./backup-form"

export default function AdminPanel() {
  const [active, setActive] = useState("config")
  const { toast } = useToast()

  useEffect(() => {
    // optional welcome toast
    toast({ title: "Welcome", description: "You are signed in to Admin." })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Tabs value={active} onValueChange={setActive}>
      <div className="flex items-center justify-between">
        <TabsList className="flex w-full flex-wrap gap-2 bg-background">
          <TabsTrigger value="config">Profilo</TabsTrigger>
          <TabsTrigger value="categories">Categorie</TabsTrigger>

          <TabsTrigger value="products">Prodotti</TabsTrigger>
        </TabsList>
        <SignOutButton />
      </div>
      <div className="mt-4">
        <TabsContent value="config">
          <ConfigForm />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesForm />
        </TabsContent>
        <TabsContent value="products">
          <ProductsForm />
        </TabsContent>
      </div>
    </Tabs>
  )
}

function SignOutButton() {
  const { toast } = useToast()
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={async () => {
        const supabase = createSupabaseClient()
        await supabase.auth.signOut()
        toast({ title: "Signed out" })
        location.reload()
      }}
    >
      Sign out
    </Button>
  )
}
