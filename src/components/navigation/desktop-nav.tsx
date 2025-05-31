"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { NavigationLinks } from "./navigation-links";
import { UserMenu } from "./user-menu";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../theme-toggle";

export function DesktopNav() {
  const { user } = useAuth();

  return (
    <div className="flex w-full items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">
              TB
            </span>
          </div>
          <span className="font-bold text-xl text-foreground">TBSA</span>
        </Link>
      </div>

      {/* Right Side - Navigation Links, Theme Toggle, and User Menu */}
      <div className="flex items-center space-x-6">
        {/* Navigation Links */}
        {user && <NavigationLinks className="flex-row space-y-0 space-x-1" />}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu or Auth Links */}
        {user ? (
          <UserMenu />
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-sm font-medium">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
