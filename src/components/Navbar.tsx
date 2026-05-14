"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone, Mail, Clock, ChevronRight, User, LogIn } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState as useStateNav } from "react";

function useSession() {
  const [session, setSession] = useStateNav<{ firstName: string; role: string } | null>(null);
  useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(d => setSession(d?.user || null)).catch(() => {});
  }, []);
  return session;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();
  const session = useSession();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/informatie", label: t("nav.services") },
    { href: "/ontdek-eritrea", label: t("nav.discover") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/afspraken", label: t("nav.appointment"), highlight: true },
  ];

  return (
    <>
      {/* Top info bar */}
      <div className="bg-navy text-white/70 text-xs hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2">
              <Phone size={12} className="text-eritrea-gold" />
              +31 70 427 6812
            </span>
            <span className="flex items-center gap-2">
              <Mail size={12} className="text-eritrea-gold" />
              info@eritreanembassy.nl
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <Clock size={12} className="text-eritrea-gold" />
              {t("topbar.hours")} {t("topbar.appointmentOnly")}
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-white/95 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/embassy-logo.svg"
                alt="Wapen van Eritrea"
                width={48}
                height={48}
                className="shrink-0 rounded-full"
              />
              <div className="hidden sm:block">
                <div className="font-display font-bold text-charcoal text-[17px] leading-tight tracking-tight">
                  Eritrese Ambassade
                </div>
                <div className="text-[10px] text-warm-gray font-semibold tracking-[0.2em] uppercase">
                  Den Haag · Nederland
                </div>
              </div>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const isHighlight = "highlight" in link && link.highlight;
                return isHighlight ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="ml-2 btn-red text-sm flex items-center gap-1.5 !px-5 !py-2.5"
                  >
                    {link.label}
                    <ChevronRight size={15} />
                  </Link>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-eritrea-blue"
                        : "text-gray-600 hover:text-navy"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 bg-eritrea-blue rounded-full" />
                    )}
                  </Link>
                );
              })}
              <div className="ml-1 border-l border-gray-200 pl-2 flex items-center gap-1">
                <LanguageSwitcher />
                {session ? (
                  <Link
                    href={session.role === "CITIZEN" ? "/mijn-account" : "/admin"}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-eritrea-blue hover:bg-eritrea-blue/8 transition-colors"
                  >
                    <User size={15} />
                    {session.firstName}
                  </Link>
                ) : (
                  <Link href="/inloggen" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-navy hover:bg-gray-100 transition-colors">
                    <LogIn size={15} />
                    Inloggen
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile: language + menu */}
            <div className="lg:hidden flex items-center gap-1">
              <LanguageSwitcher />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white py-4 px-6 space-y-1 shadow-xl">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isHighlight = "highlight" in link && link.highlight;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                    isHighlight
                      ? "bg-eritrea-red text-white mt-3 text-center shadow-md"
                      : isActive
                      ? "bg-eritrea-blue/8 text-eritrea-blue"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-2.5 text-sm text-warm-gray">
              <p className="flex items-center gap-2.5">
                <Phone size={14} className="text-eritrea-gold" /> +31 70 427 6812
              </p>
              <p className="flex items-center gap-2.5">
                <Clock size={14} className="text-eritrea-gold" /> {t("topbar.hours")}
              </p>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
