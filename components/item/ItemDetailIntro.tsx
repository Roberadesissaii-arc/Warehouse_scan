import { MapPin, Package } from "lucide-react";
import type { WarehouseItem } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

function locationPath(item: WarehouseItem) {
  const loc = item.location;
  return loc?.path || [loc?.warehouse, loc?.section, loc?.shelf].filter(Boolean).join(" → ");
}

export function ItemDetailIntro({ item }: { item: WarehouseItem }) {
  const path = locationPath(item);

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] py-0 text-white shadow-[0_10px_32px_rgba(15,118,110,0.22)] ring-0">
      <CardContent className="relative min-h-[120px] overflow-hidden px-4 py-5">
        <Package
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 size-24 text-white/20"
          strokeWidth={1.6}
        />

        <div className="relative max-w-[88%]">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/80">
            {item.sku ? `SKU ${item.sku}` : "Floor item"}
            {item.id ? ` · #${item.id}` : ""}
          </p>
          <h1 className="font-heading mt-1.5 text-[22px] font-bold leading-tight tracking-tight">{item.name}</h1>
          {path ? (
            <p className="mt-2.5 flex items-start gap-1.5 text-[13px] leading-relaxed text-white/92">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>{path}</span>
            </p>
          ) : (
            <p className="mt-2.5 text-[13px] leading-relaxed text-white/90">Ready to pick or queue for a robot.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
