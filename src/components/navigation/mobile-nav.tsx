"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavigationLinks } from "./navigation-links";
import { UserInfo } from "./user-info";

export function MobileNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push("/");
  };

  return (
    <div className="flex w-full items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-xs">
          <span className="text-primary-foreground font-bold text-sm">TB</span>
        </div>
        <span className="font-bold text-xl text-foreground">TBSA</span>
      </Link>

      {/* Mobile Menu */}
      {user ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-muted/30">
                <span className="font-semibold text-lg">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="p-6 border-b bg-muted/20">
                <UserInfo />
              </div>

              {/* Navigation Links */}
              <div className="flex-1 p-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Navigare
                  </h3>
                  <NavigationLinks onLinkClick={() => setIsOpen(false)} />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t bg-muted/20">
                <div className="space-y-2">
                  <PermissionGuard permissions={["users:update:own"]}>
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        Profil
                      </Button>
                    </Link>
                  </PermissionGuard>
                  <PermissionGuard permissions={["users:update:own"]}>
                    <Link href="/settings" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        Setări
                      </Button>
                    </Link>
                  </PermissionGuard>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex items-center space-x-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Register</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
