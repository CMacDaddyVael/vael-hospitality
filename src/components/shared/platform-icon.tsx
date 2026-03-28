import { PLATFORMS } from "@/lib/constants";

export function PlatformIcon({ platform }: { platform: string }) {
  const config = PLATFORMS.find((p) => p.value === platform);
  const color = config?.color ?? "#6B7280";
  const label = config?.label ?? platform;

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
