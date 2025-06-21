"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: "Acasă", href: "#hero" },
    { name: "Funcționalități", href: "#features" },
    { name: "Despre", href: "#about" },
    { name: "Abonamente", href: "#subscription" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/App Name - Fixed width for consistent spacing */}
          <div className="flex items-center space-x-2 flex-shrink-0 w-24 md:w-32">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  TB
                </span>
              </div>
              <span className="font-bold text-xl hidden sm:inline-block">
                TBSA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1 ">
            <div className="flex items-center space-x-8 text-sm font-medium">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="transition-colors  text-foreground/60 hover:text-foreground whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Desktop Actions - Fixed width for balance */}
          <div className="hidden lg:flex items-center justify-end space-x-4 flex-shrink-0">
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Conectează-te</Link>
              </Button>
              <Button size="sm" borderRadius="full" asChild>
                <Link href="/auth/register">Începe acum</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center space-x-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* App Name in Mobile Menu */}
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">
                        TB
                      </span>
                    </div>
                    <span className="font-bold text-xl">TBSA</span>
                  </div>

                  {/* Mobile Navigation Links */}
                  <nav className="flex flex-col space-y-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="text-left text-lg font-medium transition-colors text-foreground/80 hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Auth Buttons */}
                  <div className="flex flex-col space-y-3 pt-4 border-t">
                    <Button variant="ghost" size="default" asChild>
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        Conectează-te
                      </Link>
                    </Button>
                    <Button size="default" borderRadius="full" asChild>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsOpen(false)}
                      >
                        Începe acum
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
