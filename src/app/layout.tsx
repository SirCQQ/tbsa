import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { ViewportSizeIndicator } from "@/components/ui/viewport-size-indicator";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TBSA - Sistem de Gestionare Citiri Apă",
  description:
    "Platformă modernă pentru gestionarea citirilor de apă în clădiri rezidențiale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <AuthSessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header />
              {children}
              <Footer />
              <Toaster />
              <ViewportSizeIndicator
                position={{
                  bottom: "1rem",
                  left: "2rem",
                }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20"
              />
            </ThemeProvider>
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
