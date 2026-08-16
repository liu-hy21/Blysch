"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, PawPrint, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "首页", icon: Home },
  { href: "/timeline", label: "时间轴", icon: Clock },
  { href: "/pets", label: "守护", icon: PawPrint },
  { href: "/me", label: "我的", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="主导航"
      className="sticky bottom-0 z-30 border-t-4 border-ink bg-card"
      style={{ viewTransitionName: "persistent-nav" }}
    >
      <ul className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "mx-0.5 flex min-h-12 flex-col items-center justify-center gap-0.5 border-2 text-[11px]",
                  active
                    ? "border-ink bg-gold text-ink"
                    : "border-transparent text-ink-soft",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 2} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
