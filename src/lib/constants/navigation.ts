import type { PermissionString } from "./permissions";

export type NavigationLink = {
  href: string;
  label: string;
  permissions: PermissionString[];
  requireAll?: boolean;
};

export const NAVIGATION_LINKS: NavigationLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    permissions: [], // Available to all authenticated users
  },
  {
    href: "/admin/dashboard",
    label: "Admin Dashboard",
    permissions: [
      "buildings:read:all",
      "apartments:read:all",
      "users:read:all",
    ],
    requireAll: false, // OR logic - user needs ANY of these permissions
  },
  {
    href: "/super-admin/dashboard",
    label: "Super Admin",
    permissions: ["admin_grant:create:all"],
  },
];

export const USER_MENU_LINKS = [
  {
    href: "/profile",
    label: "Profil",
    icon: "User",
    permissions: ["users:update:own"],
  },
  {
    href: "/settings",
    label: "Setări",
    icon: "Settings",
    permissions: ["users:update:own"],
  },
] as const;
