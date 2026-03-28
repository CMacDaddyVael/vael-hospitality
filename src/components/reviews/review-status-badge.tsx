import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  draft_generated: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  skipped: { label: "Skipped", variant: "outline" },
};

export function ReviewStatusBadge({ status }: { status: string }) {
  const config = statusStyles[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
