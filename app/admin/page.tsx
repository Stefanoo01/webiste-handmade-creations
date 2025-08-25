"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
import SignInCard from "@/components/admin/sign-in-card"
import AdminPanel from "@/components/admin/admin-panel"

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    console.log("AdminPage useEffect")
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(!!data.user)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session?.user)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </main>
    )
  }

  if (!isAuthed) {
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <SignInCard />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <AdminPanel />
    </main>
  )
}
