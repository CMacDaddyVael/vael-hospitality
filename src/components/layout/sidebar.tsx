"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Inbox,
  BarChart3,
  MessageSquare,
  Zap,
  Settings,
  Building2,
  Users,
  TrendingUp,
  Phone,
} from "lucide-react";
import { PropertySwitcher } from "./property-switcher";

const navItems = [
  { href: "/reviews", label: "Reviews", icon: Inbox },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/upsell", label: "Upsell", icon: TrendingUp },
  { href: "/voice", label: "Voice", icon: Phone },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ask", label: "Ask AI", icon: MessageSquare },
  { href: "/automation", label: "Automation", icon: Zap },
];

const settingsItems = [
  { href: "/settings/property", label: "Property" },
  { href: "/settings/brand-voice", label: "Brand Voice" },
  { href: "/settings/smart-snippets", label: "Smart Snippets" },
  { href: "/settings/voice", label: "Voice Agent" },
  { href: "/settings/knowledge-base", label: "Knowledge Base" },
  { href: "/settings/integrations", label: "Integrations" },
  { href: "/settings/team", label: "Team" },
  { href: "/settings/billing", label: "Billing" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/reviews" className="flex items-center gap-2 font-bold">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span>Vael Hospitality</span>
        </Link>
      </div>

      <div className="p-3">
        <PropertySwitcher />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4">
          <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </div>
          {settingsItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-1.5 pl-10 text-sm transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
