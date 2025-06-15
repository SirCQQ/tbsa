"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { NAVIGATION_LINKS } from "@/lib/constants/navigation";

type NavigationLinksProps = {
  className?: string;
  onLinkClick?: () => void;
};

export function NavigationLinks({
  className,
  onLinkClick,
}: NavigationLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {NAVIGATION_LINKS.map((link) => (
        <PermissionGuard
          key={link.href}
          permissions={link.permissions}
          requireAll={link.requireAll}
        >
          <Link
            href={link.href}
            onClick={onLinkClick}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
              pathname === link.href
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        </PermissionGuard>
      ))}
    </nav>
  );
}
