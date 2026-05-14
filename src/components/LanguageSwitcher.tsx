"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useI18n, localeNames, localeFlags, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const locales: Locale[] = ["nl", "en", "ti"];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
        aria-label="Taal kiezen"
      >
        <span className="text-base">{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => { setLocale(loc); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                locale === loc
                  ? "bg-eritrea-blue/8 text-eritrea-blue font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-base">{localeFlags[loc]}</span>
              <span className="flex-1 text-left">{localeNames[loc]}</span>
              {locale === loc && <Check size={16} className="text-eritrea-blue" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
