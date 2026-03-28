"use client";

import type { Guest } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GUEST_SEGMENTS } from "@/lib/constants";
import { User, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export function GuestCard({ guest }: { guest: Guest }) {
  const segment = GUEST_SEGMENTS.find((s) => s.value === guest.segment);

  return (
    <Link href={`/guests/${guest.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium">
                  {guest.first_name} {guest.last_name}
                </h3>
                {guest.email && (
                  <p className="text-sm text-gray-500">{guest.email}</p>
                )}
              </div>
            </div>
            {segment && (
              <Badge
                style={{ backgroundColor: segment.color, color: "white" }}
                className="text-xs"
              >
                {segment.label}
              </Badge>
            )}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {guest.total_stays} stay{guest.total_stays !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              ${guest.total_spend?.toFixed(0) ?? "0"}
            </span>
            {guest.last_stay_at && (
              <span>Last: {format(new Date(guest.last_stay_at), "MMM yyyy")}</span>
            )}
          </div>
          {guest.tags.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {guest.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
