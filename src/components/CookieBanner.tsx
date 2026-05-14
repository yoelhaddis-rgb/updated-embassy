"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function CookieBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-navy text-white rounded-2xl shadow-2xl shadow-black/30 p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center gap-5 border border-white/10">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-eritrea-gold/20 text-eritrea-gold flex items-center justify-center shrink-0 mt-0.5">
            <Cookie size={20} />
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {t("cookie.message")}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={decline}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10"
          >
            {t("cookie.decline")}
          </button>
          <button
            onClick={accept}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold bg-eritrea-green hover:bg-eritrea-green-dark text-white transition-all shadow-md"
          >
            {t("cookie.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
