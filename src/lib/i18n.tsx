"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "nl" | "en" | "ti";

export const localeNames: Record<Locale, string> = {
  nl: "Nederlands",
  en: "English",
  ti: "ትግርኛ",
};

export const localeFlags: Record<Locale, string> = {
  nl: "🇳🇱",
  en: "🇬🇧",
  ti: "🇪🇷",
};

/* ─── Translations ─── */

type TranslationKeys = {
  // Nav
  "nav.home": string;
  "nav.services": string;
  "nav.discover": string;
  "nav.contact": string;
  "nav.appointment": string;
  "nav.faq": string;
  "nav.news": string;
  // Top bar
  "topbar.hours": string;
  "topbar.appointmentOnly": string;
  // Hero
  "hero.badge": string;
  "hero.welcome": string;
  "hero.embassy": string;
  "hero.subtitle": string;
  "hero.cta.appointment": string;
  "hero.cta.services": string;
  // Stats
  "stats.years": string;
  "stats.eritreans": string;
  "stats.services": string;
  "stats.days": string;
  // Services section
  "services.label": string;
  "services.title": string;
  "services.subtitle": string;
  "services.visa": string;
  "services.visa.desc": string;
  "services.passport": string;
  "services.passport.desc": string;
  "services.legalization": string;
  "services.legalization.desc": string;
  "services.tax": string;
  "services.tax.desc": string;
  "services.civilRegistry": string;
  "services.civilRegistry.desc": string;
  "services.powerOfAttorney": string;
  "services.powerOfAttorney.desc": string;
  "services.makeAppointment": string;
  // Gallery
  "gallery.label": string;
  "gallery.title": string;
  "gallery.titleAccent": string;
  "gallery.more": string;
  // CTA
  "cta.title": string;
  "cta.subtitle": string;
  "cta.button": string;
  // Quick info
  "info.address": string;
  "info.address.value": string;
  "info.hours": string;
  "info.hours.value": string;
  "info.phone": string;
  "info.phone.value": string;
  // Footer
  "footer.description": string;
  "footer.quickLinks": string;
  "footer.contact": string;
  "footer.openingHours": string;
  "footer.monThu": string;
  "footer.phone": string;
  "footer.friSun": string;
  "footer.closed": string;
  // Cookie
  "cookie.message": string;
  "cookie.accept": string;
  "cookie.decline": string;
  // Emergency
  "emergency.title": string;
  "emergency.call": string;
  // FAQ
  "faq.title": string;
  "faq.subtitle": string;
  // Page headers
  "page.services.title": string;
  "page.services.subtitle": string;
  "page.appointment.title": string;
  "page.appointment.subtitle": string;
  "page.contact.title": string;
  "page.contact.subtitle": string;
  "page.discover.title": string;
  "page.discover.subtitle1": string;
  "page.discover.subtitle2": string;
  "page.faq.title": string;
  "page.faq.subtitle": string;
  "page.news.title": string;
  "page.news.subtitle": string;
  "page.privacy.title": string;
  "page.privacy.subtitle": string;
  // Common
  "common.readMore": string;
  "common.back": string;
  "common.next": string;
  "common.confirm": string;
  "common.close": string;
};

const nl: TranslationKeys = {
  "nav.home": "Home",
  "nav.services": "Diensten",
  "nav.discover": "Ontdek Eritrea",
  "nav.contact": "Contact",
  "nav.appointment": "Afspraak Maken",
  "nav.faq": "FAQ",
  "nav.news": "Nieuws",
  "topbar.hours": "Ma – Do: 09:00 – 15:00",
  "topbar.appointmentOnly": "(alleen op afspraak)",
  "hero.badge": "Ambassade van de Staat Eritrea",
  "hero.welcome": "Welkom bij de",
  "hero.embassy": "Eritrese Ambassade",
  "hero.subtitle": "Uw officiële vertegenwoordiging in Nederland. Consulaire diensten, visumaanvragen en alle zaken met betrekking tot Eritrea.",
  "hero.cta.appointment": "Afspraak Maken",
  "hero.cta.services": "Bekijk Diensten",
  "stats.years": "Jaar dienst",
  "stats.eritreans": "Eritreeërs in NL",
  "stats.services": "Diensten",
  "stats.days": "Dagen / week",
  "services.label": "Consulaire Diensten",
  "services.title": "Hoe kunnen wij u helpen?",
  "services.subtitle": "Alles wat u nodig heeft onder één dak. Maak online een afspraak en upload uw documenten vooraf.",
  "services.visa": "Visumaanvraag",
  "services.visa.desc": "Toeristenvisum, zakenvisum of transitvisum voor Eritrea.",
  "services.passport": "Paspoort & ID",
  "services.passport.desc": "Nieuw paspoort, verlenging of Eritrese identiteitskaart.",
  "services.legalization": "Legalisatie",
  "services.legalization.desc": "Documenten laten legaliseren voor gebruik in Eritrea.",
  "services.tax": "Belastingbetaling",
  "services.tax.desc": "2% diaspora-belasting en andere consulaire betalingen.",
  "services.civilRegistry": "Burgerlijke Stand",
  "services.civilRegistry.desc": "Geboorte, huwelijk, overlijden registreren.",
  "services.powerOfAttorney": "Volmacht & Notarieel",
  "services.powerOfAttorney.desc": "Volmachten, verklaringen en notariële diensten.",
  "services.makeAppointment": "Afspraak maken",
  "gallery.label": "Ontdek Eritrea",
  "gallery.title": "Een land van",
  "gallery.titleAccent": "gastvrijheid",
  "gallery.more": "Meer ontdekken",
  "cta.title": "Klaar om een afspraak te maken?",
  "cta.subtitle": "Plan uw bezoek online, upload documenten vooraf en bespaar tijd bij de ambassade. Het duurt slechts 2 minuten.",
  "cta.button": "Start Afspraak",
  "info.address": "Bezoekadres",
  "info.address.value": "Javastraat 58\n2585 AR Den Haag",
  "info.hours": "Openingstijden",
  "info.hours.value": "Ma – Do: 09:00 – 15:00\nAlleen op afspraak",
  "info.phone": "Telefonisch",
  "info.phone.value": "+31 70 427 6812\nMa – Vr: 15:00 – 16:45",
  "footer.description": "De officiële vertegenwoordiging van de Staat Eritrea in het Koninkrijk der Nederlanden.",
  "footer.quickLinks": "Snelle Links",
  "footer.contact": "Contact",
  "footer.openingHours": "Openingstijden",
  "footer.monThu": "Ma – Do",
  "footer.phone": "Telefoon",
  "footer.friSun": "Vr – Zo",
  "footer.closed": "Gesloten",
  "cookie.message": "Deze website gebruikt cookies om uw ervaring te verbeteren. Door verder te gaan stemt u in met ons cookiebeleid.",
  "cookie.accept": "Accepteren",
  "cookie.decline": "Weigeren",
  "emergency.title": "Consulair noodgeval?",
  "emergency.call": "Bel 24/7",
  "faq.title": "Veelgestelde Vragen",
  "faq.subtitle": "Antwoorden op de meest gestelde vragen over onze consulaire diensten.",
  "page.services.title": "Consulaire Diensten",
  "page.services.subtitle": "Volledig overzicht van alle diensten, benodigde documenten, kosten en verwerkingstijden.",
  "page.appointment.title": "Afspraak Maken",
  "page.appointment.subtitle": "Plan uw bezoek in 4 eenvoudige stappen. Upload documenten vooraf en bespaar tijd bij de ambassade.",
  "page.contact.title": "Contact",
  "page.contact.subtitle": "Heeft u vragen? Neem contact op via telefoon, e-mail of bezoek ons aan de Javastraat in Den Haag.",
  "page.discover.title": "Ontdek Eritrea",
  "page.discover.subtitle1": "\"A land of traditional Hospitality\"",
  "page.discover.subtitle2": "\"Three Seasons in Two Hours\"",
  "page.faq.title": "Veelgestelde Vragen",
  "page.faq.subtitle": "Antwoorden op de meest gestelde vragen over onze consulaire diensten.",
  "page.news.title": "Nieuws & Aankondigingen",
  "page.news.subtitle": "Blijf op de hoogte van het laatste nieuws, evenementen en mededelingen van de ambassade.",
  "page.privacy.title": "Privacyverklaring",
  "page.privacy.subtitle": "Hoe wij omgaan met uw persoonsgegevens conform de AVG.",
  "common.readMore": "Lees meer",
  "common.back": "Vorige",
  "common.next": "Volgende",
  "common.confirm": "Bevestigen",
  "common.close": "Sluiten",
};

const en: TranslationKeys = {
  "nav.home": "Home",
  "nav.services": "Services",
  "nav.discover": "Discover Eritrea",
  "nav.contact": "Contact",
  "nav.appointment": "Book Appointment",
  "nav.faq": "FAQ",
  "nav.news": "News",
  "topbar.hours": "Mon – Thu: 09:00 – 15:00",
  "topbar.appointmentOnly": "(by appointment only)",
  "hero.badge": "Embassy of the State of Eritrea",
  "hero.welcome": "Welcome to the",
  "hero.embassy": "Eritrean Embassy",
  "hero.subtitle": "Your official representation in the Netherlands. Consular services, visa applications and all matters relating to Eritrea.",
  "hero.cta.appointment": "Book Appointment",
  "hero.cta.services": "View Services",
  "stats.years": "Years of service",
  "stats.eritreans": "Eritreans in NL",
  "stats.services": "Services",
  "stats.days": "Days / week",
  "services.label": "Consular Services",
  "services.title": "How can we help you?",
  "services.subtitle": "Everything you need under one roof. Book an appointment online and upload your documents in advance.",
  "services.visa": "Visa Application",
  "services.visa.desc": "Tourist visa, business visa or transit visa for Eritrea.",
  "services.passport": "Passport & ID",
  "services.passport.desc": "New passport, renewal or Eritrean identity card.",
  "services.legalization": "Legalization",
  "services.legalization.desc": "Legalize documents for use in Eritrea.",
  "services.tax": "Tax Payment",
  "services.tax.desc": "2% diaspora tax and other consular payments.",
  "services.civilRegistry": "Civil Registry",
  "services.civilRegistry.desc": "Register birth, marriage or death.",
  "services.powerOfAttorney": "Power of Attorney",
  "services.powerOfAttorney.desc": "Powers of attorney, declarations and notarial services.",
  "services.makeAppointment": "Book appointment",
  "gallery.label": "Discover Eritrea",
  "gallery.title": "A land of",
  "gallery.titleAccent": "hospitality",
  "gallery.more": "Discover more",
  "cta.title": "Ready to book an appointment?",
  "cta.subtitle": "Plan your visit online, upload documents in advance and save time at the embassy. It only takes 2 minutes.",
  "cta.button": "Start Appointment",
  "info.address": "Visit Address",
  "info.address.value": "Javastraat 58\n2585 AR The Hague",
  "info.hours": "Opening Hours",
  "info.hours.value": "Mon – Thu: 09:00 – 15:00\nBy appointment only",
  "info.phone": "Telephone",
  "info.phone.value": "+31 70 427 6812\nMon – Fri: 15:00 – 16:45",
  "footer.description": "The official representation of the State of Eritrea in the Kingdom of the Netherlands.",
  "footer.quickLinks": "Quick Links",
  "footer.contact": "Contact",
  "footer.openingHours": "Opening Hours",
  "footer.monThu": "Mon – Thu",
  "footer.phone": "Telephone",
  "footer.friSun": "Fri – Sun",
  "footer.closed": "Closed",
  "cookie.message": "This website uses cookies to improve your experience. By continuing you agree to our cookie policy.",
  "cookie.accept": "Accept",
  "cookie.decline": "Decline",
  "emergency.title": "Consular emergency?",
  "emergency.call": "Call 24/7",
  "faq.title": "Frequently Asked Questions",
  "faq.subtitle": "Answers to the most commonly asked questions about our consular services.",
  "page.services.title": "Consular Services",
  "page.services.subtitle": "Complete overview of all services, required documents, fees and processing times.",
  "page.appointment.title": "Book Appointment",
  "page.appointment.subtitle": "Plan your visit in 4 simple steps. Upload documents in advance and save time at the embassy.",
  "page.contact.title": "Contact",
  "page.contact.subtitle": "Have questions? Contact us by phone, email or visit us at Javastraat in The Hague.",
  "page.discover.title": "Discover Eritrea",
  "page.discover.subtitle1": "\"A land of traditional Hospitality\"",
  "page.discover.subtitle2": "\"Three Seasons in Two Hours\"",
  "page.faq.title": "Frequently Asked Questions",
  "page.faq.subtitle": "Answers to the most commonly asked questions about our consular services.",
  "page.news.title": "News & Announcements",
  "page.news.subtitle": "Stay up to date with the latest news, events and announcements from the embassy.",
  "page.privacy.title": "Privacy Policy",
  "page.privacy.subtitle": "How we handle your personal data in accordance with the GDPR.",
  "common.readMore": "Read more",
  "common.back": "Previous",
  "common.next": "Next",
  "common.confirm": "Confirm",
  "common.close": "Close",
};

const ti: TranslationKeys = {
  "nav.home": "ገጽ",
  "nav.services": "ኣገልግሎታት",
  "nav.discover": "ኤርትራ ፍለጥ",
  "nav.contact": "ርክብ",
  "nav.appointment": "ቆጸራ ሓዝ",
  "nav.faq": "ሕቶታት",
  "nav.news": "ዜና",
  "topbar.hours": "ሰኑይ – ሓሙስ: 09:00 – 15:00",
  "topbar.appointmentOnly": "(ብቆጸራ ጥራይ)",
  "hero.badge": "ኤምባሲ ሃገረ ኤርትራ",
  "hero.welcome": "ናብ",
  "hero.embassy": "ኤምባሲ ኤርትራ\nእንቋዕ ብደሓን መጻእኩም",
  "hero.subtitle": "ኣብ ሆላንድ ዝርከብ ወግዓዊ ወኪል ሃገረ ኤርትራ። ቆንስላዊ ኣገልግሎታት፡ ቪዛ፡ ፓስፖርትን ካልእ ጉዳያትን።",
  "hero.cta.appointment": "ቆጸራ ሓዝ",
  "hero.cta.services": "ኣገልግሎታት ርአ",
  "stats.years": "ዓመት ኣገልግሎት",
  "stats.eritreans": "ኤርትራውያን ኣብ ሆላንድ",
  "stats.services": "ኣገልግሎታት",
  "stats.days": "መዓልታት / ሰሙን",
  "services.label": "ቆንስላዊ ኣገልግሎታት",
  "services.title": "ብኸመይ ክንሕግዘኩም ንኽእል?",
  "services.subtitle": "ኩሉ ዘድልየኩም ኣብ ሓደ ቦታ። ብኢንተርነት ቆጸራ ሓዙን ሰነዳትኩም ቅድሚ ምምጻእኩም ኣቕርቡን።",
  "services.visa": "ቪዛ ምሕታት",
  "services.visa.desc": "ናይ ቱሪዝም፡ ንግዲ ወይ ትራንዚት ቪዛ ንኤርትራ።",
  "services.passport": "ፓስፖርት & መንነት",
  "services.passport.desc": "ሓድሽ ፓስፖርት፡ ምሕዳስ ወይ ናይ ኤርትራ መንነት ወረቐት።",
  "services.legalization": "ምስክር ወረቐት",
  "services.legalization.desc": "ሰነዳት ንኣብ ኤርትራ ዝኽውን ምውዳቕ።",
  "services.tax": "ግብሪ ምኽፋል",
  "services.tax.desc": "2% ናይ ዲያስፖራ ግብርን ካልእ ክፍሊታትን።",
  "services.civilRegistry": "ሲቪል ምዝገባ",
  "services.civilRegistry.desc": "ልደት፡ መርዓ፡ ሞት ምምዝጋብ።",
  "services.powerOfAttorney": "ውክልና & ኖተሪ",
  "services.powerOfAttorney.desc": "ውክልና፡ መብጽዓ ምሃብ፡ ናይ ኖተሪ ኣገልግሎት።",
  "services.makeAppointment": "ቆጸራ ሓዝ",
  "gallery.label": "ኤርትራ ፍለጥ",
  "gallery.title": "ሃገረ",
  "gallery.titleAccent": "ኣጋይሽ",
  "gallery.more": "ተወሳኺ ፍለጥ",
  "cta.title": "ቆጸራ ክትሕዙ ድሉዋት ዲኹም?",
  "cta.subtitle": "ብኢንተርነት ቆጸራ ሓዙ፡ ሰነዳት ቅድሚ ግዜ ኣቕርቡ፡ ኣብ ኤምባሲ ግዜ ቁጠቡ። 2 ደቒቕ ጥራይ ይወስድ።",
  "cta.button": "ቆጸራ ጀምር",
  "info.address": "ኣድራሻ",
  "info.address.value": "Javastraat 58\n2585 AR Den Haag",
  "info.hours": "ናይ ስራሕ ሰዓታት",
  "info.hours.value": "ሰኑይ – ሓሙስ: 09:00 – 15:00\nብቆጸራ ጥራይ",
  "info.phone": "ቴለፎን",
  "info.phone.value": "+31 70 427 6812\nሰኑይ – ዓርቢ: 15:00 – 16:45",
  "footer.description": "ኣብ ሃገረ ሆላንድ ዝርከብ ወግዓዊ ወኪል ሃገረ ኤርትራ።",
  "footer.quickLinks": "ቅልጡፍ ሊንክታት",
  "footer.contact": "ርክብ",
  "footer.openingHours": "ናይ ስራሕ ሰዓታት",
  "footer.monThu": "ሰኑይ – ሓሙስ",
  "footer.phone": "ቴለፎን",
  "footer.friSun": "ዓርቢ – ሰንበት",
  "footer.closed": "ዕጹው",
  "cookie.message": "እዚ ወብሳይት ኩኪስ ይጥቀም። ብምቕጻል ንናይ ኩኪ ፖሊሲና ትሰማምዑ ኣለኹም።",
  "cookie.accept": "ተቐበል",
  "cookie.decline": "ኣይፋል",
  "emergency.title": "ቆንስላዊ ህጹጽ ጉዳይ?",
  "emergency.call": "24/7 ደውሉ",
  "faq.title": "ብተደጋጋሚ ዝሕተቱ ሕቶታት",
  "faq.subtitle": "ብዛዕባ ቆንስላዊ ኣገልግሎታትና ብብዝሒ ዝሕተቱ ሕቶታትን መልስታትን።",
  "page.services.title": "ቆንስላዊ ኣገልግሎታት",
  "page.services.subtitle": "ምሉእ ዝርዝር ናይ ኩሎም ኣገልግሎታት፡ ዘድልዩ ሰነዳት፡ ክፍሊታትን ግዜ ምስላጥን።",
  "page.appointment.title": "ቆጸራ ሓዝ",
  "page.appointment.subtitle": "ብ4 ቀለልቲ ስጉምትታት ቆጸራ ሓዙ። ሰነዳት ቅድሚ ግዜ ኣቕርቡ።",
  "page.contact.title": "ርክብ",
  "page.contact.subtitle": "ሕቶ ኣለኩም? ብቴለፎን፡ ኢመይል ወይ ብኣካል ርኸቡና።",
  "page.discover.title": "ኤርትራ ፍለጥ",
  "page.discover.subtitle1": "\"ሃገረ ኣጋይሽ\"",
  "page.discover.subtitle2": "\"ሰለስተ ወቕቲ ኣብ ክልተ ሰዓት\"",
  "page.faq.title": "ብተደጋጋሚ ዝሕተቱ ሕቶታት",
  "page.faq.subtitle": "ብዛዕባ ቆንስላዊ ኣገልግሎታትና ብብዝሒ ዝሕተቱ ሕቶታት።",
  "page.news.title": "ዜናን ሓበሬታን",
  "page.news.subtitle": "ናይ ኤምባሲ ዜና፡ ፍጻመታትን ሓበሬታን።",
  "page.privacy.title": "ናይ ብሕትና ፖሊሲ",
  "page.privacy.subtitle": "ብመሰረት AVG ውልቃዊ ሓበሬታኹም ብኸመይ ከም እንሕዞ።",
  "common.readMore": "ተወሳኺ ኣንብብ",
  "common.back": "ዝሓለፈ",
  "common.next": "ዝቕጽል",
  "common.confirm": "ኣረጋግጽ",
  "common.close": "ዕጸው",
};

const translations: Record<Locale, TranslationKeys> = { nl, en, ti };

/* ─── Context ─── */

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof TranslationKeys) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  locale: "nl",
  setLocale: () => {},
  t: (key) => key,
  dir: "ltr",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("nl");

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
      document.documentElement.lang = newLocale === "ti" ? "ti" : newLocale;
    }
  }, []);

  const t = useCallback(
    (key: keyof TranslationKeys): string => {
      return translations[locale][key] || translations.nl[key] || key;
    },
    [locale]
  );

  // Tigrinya is LTR (uses Ge'ez script which is left-to-right)
  const dir = "ltr" as const;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
