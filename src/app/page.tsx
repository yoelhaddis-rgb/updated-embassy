"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import {
  FileText,
  CreditCard,
  Stamp,
  Plane,
  Users,
  CalendarCheck,
  ArrowRight,
  MapPin,
  Phone,
  Clock,
  Shield,
  ChevronRight,
} from "lucide-react";
import { images } from "@/lib/images";

const services = [
  { icon: Plane, titleKey: "services.visa" as const, descKey: "services.visa.desc" as const, accent: "border-l-eritrea-blue", iconBg: "bg-eritrea-blue/8", iconColor: "text-eritrea-blue" },
  { icon: FileText, titleKey: "services.passport" as const, descKey: "services.passport.desc" as const, accent: "border-l-eritrea-green", iconBg: "bg-eritrea-green/8", iconColor: "text-eritrea-green" },
  { icon: Stamp, titleKey: "services.legalization" as const, descKey: "services.legalization.desc" as const, accent: "border-l-eritrea-red", iconBg: "bg-eritrea-red/8", iconColor: "text-eritrea-red" },
  { icon: CreditCard, titleKey: "services.tax" as const, descKey: "services.tax.desc" as const, accent: "border-l-eritrea-gold", iconBg: "bg-eritrea-gold/10", iconColor: "text-eritrea-gold-dark" },
  { icon: Users, titleKey: "services.civilRegistry" as const, descKey: "services.civilRegistry.desc" as const, accent: "border-l-eritrea-blue", iconBg: "bg-eritrea-blue/8", iconColor: "text-eritrea-blue" },
  { icon: Shield, titleKey: "services.powerOfAttorney" as const, descKey: "services.powerOfAttorney.desc" as const, accent: "border-l-eritrea-green", iconBg: "bg-eritrea-green/8", iconColor: "text-eritrea-green" },
];

export default function HomePage() {
  const { t } = useI18n();

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[720px] md:min-h-[820px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src={images.heroSunset} alt="Asmara bij zonsondergang" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/70 via-transparent to-transparent" />
          <div className="absolute inset-0 animate-shimmer" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-8 pb-20 md:pb-28 pt-48 md:pt-56">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-10 border border-eritrea-gold/25 rounded-full bg-eritrea-gold/5 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-eritrea-gold" />
              <span className="text-eritrea-gold-light text-sm tracking-wide">{t("hero.badge")}</span>
            </div>

            <h1 className="font-display text-[3rem] md:text-[5rem] lg:text-[6rem] font-medium text-white leading-[0.93] mb-8 tracking-tight">
              {t("hero.welcome")}
              <br />
              <span className="italic text-eritrea-gold">{t("hero.embassy")}</span>
            </h1>

            <div className="w-20 h-0.5 bg-gradient-to-r from-eritrea-gold to-transparent mb-8" />

            <p className="text-lg md:text-xl text-white/55 leading-relaxed mb-12 max-w-lg whitespace-pre-line">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/afspraken" className="btn-red text-center text-base flex items-center justify-center gap-2.5 !px-10 !py-4">
                <CalendarCheck size={20} /> {t("hero.cta.appointment")}
              </Link>
              <Link href="/informatie" className="group bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white/80 font-medium px-10 py-4 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 text-center text-base flex items-center justify-center gap-2">
                {t("hero.cta.services")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-white/8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "30+", label: t("stats.years") },
              { value: "50K+", label: t("stats.eritreans") },
              { value: "6", label: t("stats.services") },
              { value: "4", label: t("stats.days") },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-4xl md:text-[3.2rem] font-medium text-white leading-none">{stat.value}</div>
                <div className="text-sm text-white/35 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ERITREAN GRADIENT LINE ─── */}
      <div className="eritrea-line" />

      {/* ═══════════════════════════════════════════════
          SERVICES — Light section. Left-aligned.
          Padding: 120px top, 80px bottom (soul detail #3)
          Cards: no borders, bg stepping (soul detail #4)
      ═══════════════════════════════════════════════ */}
      <section className="bg-ivory pt-[120px] pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="max-w-2xl mb-20">
            <span className="section-label bg-eritrea-green/8 text-eritrea-green mb-6">
              {t("services.label")}
            </span>
            <h2 className="font-display text-4xl md:text-[3.2rem] font-medium text-charcoal leading-[1.1] tracking-tight mb-5">
              {t("services.title")}
            </h2>
            <div className="w-16 h-0.5 bg-eritrea-gold mb-6" />
            <p className="text-warm-gray text-lg leading-relaxed">
              {t("services.subtitle")}
            </p>
          </div>

          {/* Cards on parchment bg — no borders (soul detail #4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <Link
                key={service.titleKey}
                href="/afspraken"
                className={`group bg-parchment/60 hover:bg-white rounded-2xl overflow-hidden border-l-4 ${service.accent} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-charcoal/5`}
              >
                <div className="p-7">
                  <div className={`w-12 h-12 rounded-lg ${service.iconBg} ${service.iconColor} flex items-center justify-center mb-5`}>
                    <service.icon size={22} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display font-medium text-charcoal text-lg mb-2 group-hover:text-eritrea-blue transition-colors duration-200">
                    {t(service.titleKey)}
                  </h3>
                  <p className="text-warm-gray text-sm leading-relaxed mb-5">{t(service.descKey)}</p>
                  <span className="inline-flex items-center gap-1.5 text-eritrea-blue text-sm font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                    {t("services.makeAppointment")} <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ERITREAN GRADIENT LINE ─── */}
      <div className="eritrea-line" />

      {/* ═══════════════════════════════════════════════
          DISCOVER ERITREA — The dark section (soul detail #8)
          Centered (contrast with left-aligned services)
          Photo bg with navy overlay
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={images.landscape} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-navy/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 pt-[120px] pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-label bg-eritrea-gold/12 text-eritrea-gold-light mb-8">
              {t("gallery.label")}
            </span>
            <h2 className="font-display text-4xl md:text-[3.2rem] font-medium text-white leading-[1.1] tracking-tight mb-8">
              {t("gallery.title")}<span className="italic text-eritrea-gold"> {t("gallery.titleAccent")}</span>
            </h2>
            <div className="w-16 h-0.5 bg-eritrea-gold/30 mx-auto mb-8" />
            {/* Body text 60% on dark (soul detail #14) */}
            <p className="text-white/55 text-lg md:text-xl leading-relaxed mb-6 max-w-2xl mx-auto">
              Eritrea ligt aan de Rode Zee in de Hoorn van Afrika. Met negen etnische groepen,
              een rijke koffiecultuur en de UNESCO-werelderfgoedstad Asmara biedt het land
              een unieke mix van Afrikaanse en Midden-Oosterse tradities.
            </p>
            <p className="text-white/35 text-base leading-relaxed mb-12 max-w-xl mx-auto">
              Van de groene hooglanden tot de koraalriffen van de Dahlak-archipel —
              ontdek waarom Eritrea bekend staat als het land van drie seizoenen in twee uur.
            </p>
            <Link href="/ontdek-eritrea" className="btn-gold inline-flex items-center gap-2.5 text-base">
              Ontdek Eritrea <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── ERITREAN GRADIENT LINE ─── */}
      <div className="eritrea-line" />

      {/* ═══════════════════════════════════════════════
          CTA — Eritrean red. Bold. Inverted button.
          The gradient line above creates the transition.
      ═══════════════════════════════════════════════ */}
      <section className="bg-eritrea-red relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-8 py-24 md:py-28">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-lg">
              <h2 className="font-display text-4xl md:text-5xl font-medium text-white mb-5 tracking-tight leading-tight">
                {t("cta.title")}
              </h2>
              <div className="w-16 h-0.5 bg-white/25 mb-5" />
              <p className="text-white/60 text-lg">
                {t("cta.subtitle")}
              </p>
            </div>
            <Link href="/afspraken" className="group bg-white hover:bg-ivory text-eritrea-red font-semibold text-lg px-12 py-5 rounded-lg transition-all duration-200 hover:-translate-y-1 shrink-0 flex items-center gap-3 active:scale-[0.97]">
              <CalendarCheck size={22} /> {t("cta.button")}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── ERITREAN GRADIENT LINE ─── */}
      <div className="eritrea-line" />

      {/* ═══════════════════════════════════════════════
          QUICK INFO — Clean. Dividers not cards.
          Padding: 120px top, 80px bottom.
      ═══════════════════════════════════════════════ */}
      <section className="bg-ivory pt-[120px] pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-stone/50">
            {[
              { icon: MapPin, titleKey: "info.address" as const, lines: t("info.address.value").split("\n"), sub: "Tram 9 · Halte Javaplein", color: "text-eritrea-blue", bg: "bg-eritrea-blue/8" },
              { icon: Clock, titleKey: "info.hours" as const, lines: t("info.hours.value").split("\n"), sub: "Telefoon: 15:00 – 16:45", color: "text-eritrea-green", bg: "bg-eritrea-green/8" },
              { icon: Phone, titleKey: "info.phone" as const, lines: t("info.phone.value").split("\n"), sub: "", color: "text-eritrea-red", bg: "bg-eritrea-red/8" },
            ].map((item, i) => (
              <div key={item.titleKey} className={`flex items-start gap-5 px-8 py-8 md:py-4 ${i === 0 ? "md:pl-0" : ""} ${i === 2 ? "md:pr-0" : ""}`}>
                <div className={`w-12 h-12 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon size={22} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-display font-medium text-charcoal text-base mb-2">{t(item.titleKey)}</h3>
                  {item.lines.map((line) => (
                    <p key={line} className="text-warm-gray text-sm leading-relaxed">{line}</p>
                  ))}
                  <p className="text-xs text-warm-gray/50 mt-2">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
