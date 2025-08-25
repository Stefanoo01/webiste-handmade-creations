"use client"
import { Button } from "@/components/ui/button"

export default function ContactForm() {
  return (
    <form
      className="mt-8 grid gap-3 rounded-lg border p-4"
      onSubmit={(e) => {
        e.preventDefault()
        alert("Thanks! This demo form is client-only.")
      }}
    >
      <h2 className="text-lg font-semibold">Inviami un messaggio veloce</h2>
      <input
        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        name="name"
        placeholder="Il tuo nome"
        required
      />
      <input
        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        name="email"
        placeholder="la tua email"
        required
        type="email"
      />
      <textarea
        className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        name="message"
        placeholder="Il tuo messaggio"
        required
      />
      <Button type="submit" className="w-fit">
        Invia
      </Button>
    </form>
  )
}