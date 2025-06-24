"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Building2, Home, Users, Settings } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type PageNavigationProps = {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  className?: string;
};

export function PageNavigation({
  breadcrumbs,
  title,
  className,
}: PageNavigationProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs if not provided
  const generatedBreadcrumbs = breadcrumbs || generateBreadcrumbs(pathname);
  const pageTitle =
    title || generatedBreadcrumbs[generatedBreadcrumbs.length - 1]?.label;

  return (
    <div className={className}>
      {/* Page Title for Mobile Navbar */}
      <div className="lg:hidden">
        <h1 className="text-lg font-semibold text-foreground truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="hidden sm:block">
        <Breadcrumb>
          <BreadcrumbList>
            {generatedBreadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === generatedBreadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="flex items-center gap-1.5">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href || "#"}
                        className="flex items-center gap-1.5"
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Mobile Breadcrumb (simplified) */}
      <div className="sm:hidden">
        {generatedBreadcrumbs.length > 1 && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={
                      generatedBreadcrumbs[generatedBreadcrumbs.length - 2]
                        ?.href || "#"
                    }
                    className="flex items-center gap-1.5 text-sm"
                  >
                    {generatedBreadcrumbs[generatedBreadcrumbs.length - 2]
                      ?.icon &&
                      React.createElement(
                        generatedBreadcrumbs[generatedBreadcrumbs.length - 2]
                          .icon!,
                        { className: "h-4 w-4" }
                      )}
                    {
                      generatedBreadcrumbs[generatedBreadcrumbs.length - 2]
                        ?.label
                    }
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm">
                  {generatedBreadcrumbs[generatedBreadcrumbs.length - 1]?.label}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
    </div>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Home
  breadcrumbs.push({
    label: "Acasă",
    href: "/",
    icon: Home,
  });

  // Build breadcrumbs based on path segments
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const segment = segments[i];
    // Skip dynamic segments that are IDs (UUIDs or similar)
    if (isId(segment)) {
      continue;
    }

    switch (segment) {
      case "org":
        // Skip org segment, but handle the org ID
        if (i + 1 < segments.length) {
          const orgId = segments[i + 1];
          // Organization ID is always the next segment after "org"

          breadcrumbs.push({
            label: "Organizație",
            href: `/org/${orgId}/dashboard`,
            icon: Building2,
          });
          i++; // Skip the org ID segment
          currentPath += `/${segments[i]}`;
        }
        break;
      case "dashboard":
        // Check if this is org dashboard or main dashboard
        if (breadcrumbs.some((b) => b.label === "Organizație")) {
          breadcrumbs.push({
            label: "Dashboard",
            href: currentPath,
            icon: Settings,
          });
        } else {
          breadcrumbs.push({
            label: "Dashboard",
            href: "/dashboard",
            icon: Home,
          });
        }
        break;
      case "admin":
        breadcrumbs.push({
          label: "Administrare",
          href: currentPath,
          icon: Settings,
        });
        break;
      case "buildings":
        if (i + 1 < segments.length && !isKnownSegment(segments[i + 1])) {
          // This is a specific building (next segment is building ID)
          breadcrumbs.push({
            label: "Clădiri",
            href: currentPath.replace(`/${segments[i + 1]}`, ""),
            icon: Building2,
          });
          breadcrumbs.push({
            label: "Detalii Clădire",
            href: currentPath + `/${segments[i + 1]}`,
            icon: Building2,
          });
          i++; // Skip the building ID
          currentPath += `/${segments[i]}`;
        } else {
          breadcrumbs.push({
            label: "Clădiri",
            href: currentPath,
            icon: Building2,
          });
        }
        break;
      case "apartments":
        if (i + 1 < segments.length && !isKnownSegment(segments[i + 1])) {
          // This is a specific apartment (next segment is apartment ID)
          breadcrumbs.push({
            label: "Apartamente",
            href: currentPath.replace(`/${segments[i + 1]}`, ""),
          });
          breadcrumbs.push({
            label: "Detalii Apartament",
            href: currentPath + `/${segments[i + 1]}`,
            icon: Home,
          });
          i++; // Skip the apartment ID
          currentPath += `/${segments[i]}`;
        } else {
          breadcrumbs.push({
            label: "Apartamente",
            href: currentPath,
            icon: Home,
          });
        }
        break;
      case "users":
        breadcrumbs.push({
          label: "Utilizatori",
          href: currentPath,
          icon: Users,
        });
        break;
      default:
        // Capitalize first letter for unknown segments
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath,
        });
    }
  }

  return breadcrumbs;
}

function isId(segment: string): boolean {
  // Check if segment looks like a UUID or similar ID
  return (
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      segment
    ) ||
    /^[a-zA-Z0-9]{10,}$/.test(segment) ||
    segment.length > 10
  ); // Assume strings longer than 10 chars are IDs
}

function isKnownSegment(segment: string): boolean {
  // List of known route segments that are not IDs
  const knownSegments = [
    "dashboard",
    "admin",
    "buildings",
    "apartments",
    "users",
    "settings",
    "profile",
    "reports",
    "notifications",
  ];
  return knownSegments.includes(segment);
}

// Hook to get current page title for navbar
export function usePageTitle(): string {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  return breadcrumbs[breadcrumbs.length - 1]?.label || "TBSA";
}
