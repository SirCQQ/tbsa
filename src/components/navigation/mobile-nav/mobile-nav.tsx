"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NavigationLinks } from "../navigation-links";
import { UserInfo } from "../user-info";

export function MobileNav() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="flex h-16 items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">TB</span>
        </div>
        <span className="font-bold text-xl">TBSA</span>
      </Link>

      {/* Mobile Menu */}
      {user ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="font-semibold text-lg">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Info */}
              <div className="py-4 border-b">
                <UserInfo />
              </div>

              {/* Navigation Links */}
              <div className="flex-1 py-4">
                <NavigationLinks onLinkClick={() => setIsOpen(false)} />
              </div>

              {/* Logout Button */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
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
