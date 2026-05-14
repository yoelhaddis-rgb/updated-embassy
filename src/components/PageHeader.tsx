"use client";

import { useI18n } from "@/lib/i18n";

interface PageHeaderProps {
  titleKey: string;
  subtitleKey: string;
  badge?: string;
}

export default function PageHeader({ titleKey, subtitleKey, badge }: PageHeaderProps) {
  const { t } = useI18n();

  return (
    <section className="gradient-hero-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 flag-bar"><div /><div /><div /></div>
      <div className="relative max-w-7xl mx-auto px-8 pt-16 pb-20 md:pt-20 md:pb-24">
        <div className="max-w-3xl">
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 text-white/60 text-sm mb-6">
              {badge}
            </div>
          )}
          <h1 className="font-display text-3xl md:text-5xl font-medium text-white mb-4 tracking-tight">
            {t(titleKey as any)}
          </h1>
          <p className="text-white/45 text-lg max-w-xl">
            {t(subtitleKey as any)}
          </p>
        </div>
      </div>
    </section>
  );
}
