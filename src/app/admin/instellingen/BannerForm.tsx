"use client";

import { useState } from "react";
import { Loader2, Save, AlertTriangle, Info, XCircle } from "lucide-react";
import { saveBannerSettingAction } from "@/app/actions/settings";

interface Props {
  initialActive: boolean;
  initialText: string;
  initialType: string;
}

const TYPE_OPTIONS = [
  { value: "warning", label: "⚠️ Waarschuwing", desc: "Oranje — tijdelijke sluiting, storing", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "info", label: "ℹ️ Informatie", desc: "Blauw — nieuw beleid, aankondiging", color: "text-eritrea-blue bg-eritrea-blue/5 border-eritrea-blue/20" },
  { value: "closed", label: "🔴 Gesloten", desc: "Rood — ambassade gesloten (feestdag, vakantie)", color: "text-eritrea-red bg-eritrea-red/8 border-eritrea-red/20" },
];

export function BannerForm({ initialActive, initialText, initialType }: Props) {
  const [active, setActive] = useState(initialActive);
  const [text, setText] = useState(initialText);
  const [type, setType] = useState(initialType || "warning");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    const result = await saveBannerSettingAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  const selectedType = TYPE_OPTIONS.find((t) => t.value === type) ?? TYPE_OPTIONS[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Toggle */}
      <div className="flex items-center justify-between p-4 bg-parchment/40 rounded-xl">
        <div>
          <p className="font-semibold text-charcoal text-sm">Banner actief</p>
          <p className="text-xs text-warm-gray mt-0.5">Zichtbaar voor alle bezoekers bovenaan de site</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-stone/40 peer-focus:ring-2 peer-focus:ring-eritrea-blue/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-eritrea-green"></div>
        </label>
      </div>

      {/* Type selector */}
      <div>
        <label className="form-label">Type banner</label>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                type === option.value
                  ? `border-charcoal/40 ${option.color}`
                  : "border-stone/40 bg-white hover:border-stone"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={type === option.value}
                onChange={() => setType(option.value)}
                className="sr-only"
              />
              <span className="text-sm font-semibold">{option.label}</span>
              <span className="text-xs text-warm-gray leading-tight">{option.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Text */}
      <div>
        <label className="form-label">Bannertekst</label>
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="form-input resize-none"
          placeholder="bijv. De ambassade is gesloten op maandag 27 mei wegens Tweede Pinksterdag. Afspraken op deze datum worden verzet."
        />
        <p className="text-xs text-warm-gray mt-1">{text.length} tekens</p>
      </div>

      {/* Live preview */}
      {active && text && (
        <div>
          <p className="form-label mb-2">Voorbeeld</p>
          <div className={`border rounded-xl p-3 text-sm flex items-start gap-2 ${selectedType.color}`}>
            {type === "warning" && <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
            {type === "info" && <Info size={16} className="shrink-0 mt-0.5" />}
            {type === "closed" && <XCircle size={16} className="shrink-0 mt-0.5" />}
            <p>{text}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-eritrea-red text-sm bg-eritrea-red/5 px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-red flex items-center gap-2 w-full justify-center"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Opslaan...</>
        ) : saved ? (
          <><Save size={16} /> ✓ Opgeslagen!</>
        ) : (
          <><Save size={16} /> Instellingen opslaan</>
        )}
      </button>
    </form>
  );
}
