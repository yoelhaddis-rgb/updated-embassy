"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createWalkInAction } from "@/app/actions/appointments";

const SERVICES = [
  { id: "id-nieuw", title: "ID Nieuwe aanvragers" },
  { id: "id-vervanging", title: "ID Vervanging" },
  { id: "id-minderjarig", title: "Minderjarige ID-kaarten" },
  { id: "paspoort-nieuw", title: "Eritrees nieuw paspoort" },
  { id: "paspoort-aanvraag", title: "Paspoort Aanvraag" },
  { id: "paspoort-vervanging", title: "Eritrese paspoortvervanging" },
  { id: "visum", title: "Visum / Visa" },
  { id: "volmacht", title: "Volmacht / Power of Attorney" },
  { id: "huwelijk", title: "Huwelijksakte / Marriage Certificate" },
  { id: "wroeging", title: "Wroeging / Remorse" },
  { id: "belasting", title: "2% Belasting / 2% Tax" },
  { id: "persoonlijk-doc", title: "Persoonlijk officieel document" },
];

function getCurrentTimeSlot(): string {
  const now = new Date();
  const minutes = Math.round(now.getMinutes() / 15) * 15;
  const h = now.getHours();
  const m = minutes === 60 ? 0 : minutes;
  const hh = (minutes === 60 ? h + 1 : h).toString().padStart(2, "0");
  return `${hh}:${m.toString().padStart(2, "0")}`;
}

export function WalkInForm({ date }: { date: string }) {
  const [open, setOpen] = useState(false);
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [timeSlot, setTimeSlot] = useState(getCurrentTimeSlot());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const service = SERVICES.find(s => s.id === serviceId)!;
    const result = await createWalkInAction({
      serviceId,
      serviceTitle: service.title,
      date,
      timeSlot,
      notes: notes || undefined,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setNotes("");
      setTimeSlot(getCurrentTimeSlot());
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-semibold text-white bg-eritrea-blue px-3 py-2 rounded-lg hover:bg-eritrea-blue/90 transition-colors"
      >
        <Plus size={14} /> Inloper
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 flex-wrap bg-white/10 rounded-lg px-3 py-2"
    >
      <select
        value={serviceId}
        onChange={e => setServiceId(e.target.value)}
        className="text-xs bg-white/90 text-charcoal rounded px-2 py-1.5 border-0 focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      >
        {SERVICES.map(s => (
          <option key={s.id} value={s.id}>{s.title}</option>
        ))}
      </select>
      <input
        type="time"
        value={timeSlot}
        onChange={e => setTimeSlot(e.target.value)}
        className="text-xs bg-white/90 text-charcoal rounded px-2 py-1.5 border-0 w-24 focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      />
      <input
        type="text"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Naam (optioneel)"
        className="text-xs bg-white/90 text-charcoal rounded px-2 py-1.5 border-0 w-32 focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-xs font-semibold text-white bg-eritrea-green px-3 py-1.5 rounded-lg hover:bg-eritrea-green/90 disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : "Toevoegen"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-white/60 hover:text-white"
      >
        <X size={16} />
      </button>
      {error && <p className="text-xs text-eritrea-red w-full">{error}</p>}
    </form>
  );
}
