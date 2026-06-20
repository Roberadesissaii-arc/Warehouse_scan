"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Layers,
  LayoutList,
  ScanLine,
  UserRound,
} from "lucide-react";

const TABS = [
  { href: "/home", label: "Home", icon: LayoutGrid },
  { href: "/tasks", label: "Tasks", icon: LayoutList },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/fleet", label: "Fleet", icon: Layers },
  { href: "/account", label: "Account", icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="bottom-nav-wrap" aria-hidden={false}>
      <nav className="bottom-nav" aria-label="Main">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isScan = href === "/scan";
          const active =
            pathname === href ||
            (href === "/tasks" && pathname.startsWith("/tasks/")) ||
            (href === "/scan" && pathname.startsWith("/i/"));
          return (
            <Link
              key={href}
              href={href}
              className={[active && "active", isScan && "bottom-nav-scan"].filter(Boolean).join(" ") || undefined}
              aria-current={active ? "page" : undefined}
              aria-label={isScan ? "Scan" : undefined}
            >
              <span className="bottom-nav-icon" aria-hidden>
                <Icon strokeWidth={active || isScan ? 2.4 : 2} />
              </span>
              {!isScan ? <span className="bottom-nav-label">{label}</span> : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
