import Link from "next/link";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "#features", label: "Funcționalități" },
    { href: "#about", label: "Despre noi" },
    { href: "/login", label: "Conectează-te" },
    { href: "/register", label: "Înregistrează-te" },
  ];

  const legalLinks = [
    { href: "/privacy", label: "Politica de confidențialitate" },
    { href: "/terms", label: "Termeni și condiții" },
    { href: "/cookies", label: "Politica cookies" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TBSA</span>
            </Link>
            <p className="mb-6 text-sm leading-6 max-w-md">
              Platforma modernă pentru gestionarea asociațiilor de apartamente.
              Simplifică administrarea, automatizează procesele și îmbunătățește
              comunicarea între administratori și proprietari.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-blue-400" />
                contact@tbsa.ro
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-blue-400" />
                +40 123 456 789
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                Iași, România
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Navigare rapidă
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {currentYear} TBSA. Toate drepturile rezervate.
          </p>
          <p className="text-sm text-gray-400 mt-4 md:mt-0">
            Construit cu ❤️ pentru comunități mai bune
          </p>
        </div>
      </div>
    </footer>
  );
}
