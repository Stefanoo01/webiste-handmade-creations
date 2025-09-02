import { Metadata } from "next"
import { Suspense } from "react"
import ClientFavorites from "./client-favorites"

export const metadata: Metadata = {
  title: "Preferiti",
  description: "I tuoi prodotti preferiti salvati nella sessione.",
}

export default async function FavoritesPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Preferiti</h1>
        <Suspense>
          <ClientFavorites />
        </Suspense>
      </div>
    </main>
  )
}

