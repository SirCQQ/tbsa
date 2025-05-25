"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/auth/user-nav";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const navigationItems = [
    { href: "#features", label: "Funcționalități" },
    { href: "#about", label: "Despre" },
    { href: "#contact", label: "Contact" },
  ];

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">TBSA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {!isAuthenticated &&
            navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        {/* Right Side - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <UserNav user={user} onLogout={handleLogout} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Conectează-te</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Începe acum</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {!isAuthenticated &&
                navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

              {isAuthenticated && user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <div className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.email} •{" "}
                    {user.role === "ADMINISTRATOR"
                      ? "Administrator"
                      : "Proprietar"}
                  </div>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      Profil
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-red-600"
                    onClick={handleLogout}
                  >
                    Deconectare
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Conectează-te
                    </Link>
                  </Button>
                  <Button asChild className="justify-start">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Începe acum
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
