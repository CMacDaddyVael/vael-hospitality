"use client";

import { useApp } from "@/lib/hooks/use-active-property";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export function PropertySwitcher() {
  const { properties, activeProperty, setActivePropertyId } = useApp();

  if (properties.length <= 1) {
    return (
      <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <Building2 className="h-4 w-4 text-gray-400" />
        <span className="truncate font-medium">
          {activeProperty?.name ?? "No property"}
        </span>
      </div>
    );
  }

  return (
    <Select
      value={activeProperty?.id ?? ""}
      onValueChange={(v) => v && setActivePropertyId(v)}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {properties.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
