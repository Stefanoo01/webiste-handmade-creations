import { ShoppingCart, Plus } from "lucide-react";

export function CartAddIcon() {
  return (
    <div className="relative inline-block w-6 h-6">
      <ShoppingCart className="w-6 h-6 text-background" />
      <Plus className="w-2 h-2 text-foreground absolute -bottom-1 -right-1 bg-background rounded-full" />
    </div>
  );
}