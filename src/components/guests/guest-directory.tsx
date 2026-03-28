"use client";

import { useState } from "react";
import type { Guest } from "@/lib/types";
import { GuestCard } from "./guest-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GUEST_SEGMENTS } from "@/lib/constants";
import { Search, Upload, Plus, Users } from "lucide-react";
import Link from "next/link";

export function GuestDirectory({
  guests,
  propertyId,
}: {
  guests: Guest[];
  propertyId: string;
}) {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");

  const filtered = guests.filter((g) => {
    const matchesSearch =
      !search ||
      `${g.first_name} ${g.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase());
    const matchesSegment = !segment || segment === "all" || g.segment === segment;
    return matchesSearch && matchesSegment;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Guests</h1>
        <div className="flex gap-2">
          <Link href="/guests/import">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" /> Import CSV
            </Button>
          </Link>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Guest
          </Button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={segment} onValueChange={(v) => setSegment(v ?? "")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Segments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            {GUEST_SEGMENTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700">No guests yet</h3>
          <p className="text-sm mt-1">
            Import guests via CSV, connect your PMS, or add them manually.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((guest) => (
            <GuestCard key={guest.id} guest={guest} />
          ))}
        </div>
      )}
    </div>
  );
}
