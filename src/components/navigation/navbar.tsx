"use client";

import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center px-4 lg:px-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex md:w-full">
          <DesktopNav />
        </div>

        {/* Mobile Navigation */}
        <div className="flex w-full md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
