"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "@/hooks/use-toast"

type FavoritesContextValue = {
  favoriteProductIds: string[]
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string, productTitle?: string) => void
  addFavorite: (productId: string, productTitle?: string) => void
  removeFavorite: (productId: string, productTitle?: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

const STORAGE_KEY = "favoriteProductsSession"

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>([])

  // Initialize from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      setFavoriteProductIds(raw ? JSON.parse(raw) : [])
    } catch {
      setFavoriteProductIds([])
    }
  }, [])

  // Persist to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteProductIds))
    } catch {}
  }, [favoriteProductIds])

  const isFavorite = useCallback((productId: string) => {
    return favoriteProductIds.includes(productId)
  }, [favoriteProductIds])

  const addFavorite = useCallback((productId: string, productTitle?: string) => {
    setFavoriteProductIds((prev) => {
      if (prev.includes(productId)) return prev
      toast({ title: "Aggiunto ai preferiti", description: productTitle })
      return [...prev, productId]
    })
  }, [])

  const removeFavorite = useCallback((productId: string, productTitle?: string) => {
    setFavoriteProductIds((prev) => {
      if (!prev.includes(productId)) return prev
      toast({ title: "Rimosso dai preferiti", description: productTitle })
      return prev.filter((id) => id !== productId)
    })
  }, [])

  const toggleFavorite = useCallback((productId: string, productTitle?: string) => {
    setFavoriteProductIds((prev) => {
      if (prev.includes(productId)) {
        toast({ title: "Rimosso dai preferiti", description: productTitle })
        return prev.filter((id) => id !== productId)
      }
      toast({ title: "Aggiunto ai preferiti", description: productTitle })
      return [...prev, productId]
    })
  }, [])

  const value = useMemo(() => ({ favoriteProductIds, isFavorite, toggleFavorite, addFavorite, removeFavorite }), [favoriteProductIds, isFavorite, toggleFavorite, addFavorite, removeFavorite])

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider")
  return ctx
}


