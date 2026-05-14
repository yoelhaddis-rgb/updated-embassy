"use client";

import { useState } from "react";
import { Phone, X, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function EmergencyBanner() {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-eritrea-red/10 border-b border-eritrea-red/20">
      <div className="max-w-7xl mx-auto px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <AlertTriangle size={16} className="text-eritrea-red shrink-0" />
          <span className="text-eritrea-red font-semibold">{t("emergency.title")}</span>
          <a
            href="tel:+31704276812"
            className="flex items-center gap-1.5 text-eritrea-red-dark font-bold hover:underline"
          >
            <Phone size={14} />
            {t("emergency.call")}: +31 70 427 6812
          </a>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-eritrea-red/50 hover:text-eritrea-red transition-colors p-1"
          aria-label="Sluiten"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
