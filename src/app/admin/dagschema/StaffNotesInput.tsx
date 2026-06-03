"use client";

import { useState, useRef } from "react";
import { MessageSquare, Check, Loader2 } from "lucide-react";
import { saveStaffNotesAction } from "@/app/actions/appointments";

export function StaffNotesInput({
  appointmentId,
  initialNotes,
}: {
  appointmentId: string;
  initialNotes: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => ref.current?.focus(), 50);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const result = await saveStaffNotesAction(appointmentId, notes);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
    if (e.key === "Escape") setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded no-print transition-colors ${
          initialNotes
            ? "text-eritrea-blue bg-eritrea-blue/10 hover:bg-eritrea-blue/20"
            : "text-warm-gray/50 hover:text-warm-gray hover:bg-stone/20"
        }`}
        title={initialNotes ? `Notitie: ${initialNotes}` : "Notitie toevoegen"}
      >
        <MessageSquare size={11} />
        {initialNotes ? "Notitie" : "＋"}
      </button>
    );
  }

  return (
    <div className="flex items-start gap-1.5 no-print">
      <textarea
        ref={ref}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="Interne notitie (niet zichtbaar voor burger)…"
        className="text-xs text-charcoal bg-parchment/60 border border-stone/40 rounded px-2 py-1.5 w-48 resize-none focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      />
      <button
        onClick={handleSave}
        disabled={loading || saved}
        className="text-white bg-eritrea-blue rounded px-2 py-1.5 hover:bg-eritrea-blue/90 disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
      </button>
      {error && <p className="text-xs text-eritrea-red mt-1 w-full">{error}</p>}
    </div>
  );
}
