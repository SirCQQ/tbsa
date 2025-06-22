"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, User, LogOut, Settings, Building2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    user,
    isLoading,
    isAuthenticated,
    getFullName,
    getInitials,
    getCurrentOrganization,
  } = useCurrentUser();

  const navigationItems = [
    { name: "Acasă", href: "#hero" },
    { name: "Funcționalități", href: "#features" },
    { name: "Despre", href: "#about" },
    { name: "Abonamente", href: "#subscription" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-muted rounded-full" />
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.image || ""}
                          alt={getFullName() || ""}
                        />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {getFullName()}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        {getCurrentOrganization() && (
                          <p className="text-xs leading-none text-muted-foreground">
                            <Building2 className="inline h-3 w-3 mr-1" />
                            {getCurrentOrganization()?.name}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        className="justify-start items-start"
                        href="/dashboard"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        className="justify-start items-start"
                        href="/dashboard/profile"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Setări</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Deconectare</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Conectează-te</Link>
                </Button>
                <Button size="sm" borderRadius="full" asChild>
                  <Link href="/auth/register">Începe acum</Link>
                </Button>
              </div>
            )}
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

                  {/* Mobile Auth/User Section */}
                  <div className="flex flex-col space-y-3 pt-4 border-t justify-center items-start w-full">
                    {isLoading ? (
                      <div className="flex items-center space-x-3 p-2 w-full">
                        <div className="w-10 h-10 animate-pulse bg-muted rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                          <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                        </div>
                      </div>
                    ) : isAuthenticated ? (
                      <>
                        {/* User Info */}
                        <div className="flex items-center space-x-3 p-2 w-full bg-muted/50 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={user?.image || ""}
                              alt={getFullName() || ""}
                            />
                            <AvatarFallback>{getInitials()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {getFullName()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user?.email}
                            </p>
                            {getCurrentOrganization() && (
                              <p className="text-xs text-muted-foreground">
                                <Building2 className="inline h-3 w-3 mr-1" />
                                {getCurrentOrganization()?.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Authenticated User Actions */}
                        <Button variant="ghost" size="default" asChild>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </Button>
                        <Button variant="ghost" size="default" asChild>
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setIsOpen(false)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Setări
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="default"
                          className="text-red-600 justify-start hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => {
                            setIsOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Deconectare
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Guest Actions */}
                        <Button variant="ghost" size="default" asChild>
                          <Link
                            href="/auth/login"
                            onClick={() => setIsOpen(false)}
                          >
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
                      </>
                    )}
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
