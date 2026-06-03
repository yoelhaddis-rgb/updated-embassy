"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";

interface Props {
  appointmentId: string;
  initialStatus: string;
}

export function CheckInButton({ appointmentId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleMarkAttended = async () => {
    setLoading(true);
    const result = await updateAppointmentStatusAction(appointmentId, "ATTENDED");
    if (!result?.error) setStatus("ATTENDED");
    setLoading(false);
  };

  const handleMarkNoShow = async () => {
    setLoading(true);
    const result = await updateAppointmentStatusAction(appointmentId, "NO_SHOW");
    if (!result?.error) setStatus("NO_SHOW");
    setLoading(false);
  };

  const handleUndo = async () => {
    setLoading(true);
    const result = await updateAppointmentStatusAction(appointmentId, "CONFIRMED");
    if (!result?.error) setStatus("CONFIRMED");
    setLoading(false);
  };

  if (loading) {
    return <Loader2 size={16} className="animate-spin text-warm-gray/50" />;
  }

  if (status === "ATTENDED") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-eritrea-green bg-eritrea-green/10 px-2.5 py-1 rounded-lg">
          <Check size={12} /> Aanwezig
        </span>
        <button
          onClick={handleUndo}
          className="text-xs text-warm-gray/50 hover:text-warm-gray underline"
          title="Ongedaan maken"
        >
          undo
        </button>
      </div>
    );
  }

  if (status === "NO_SHOW") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-eritrea-red bg-eritrea-red/10 px-2.5 py-1 rounded-lg">
          <X size={12} /> Niet gekomen
        </span>
        <button
          onClick={handleUndo}
          className="text-xs text-warm-gray/50 hover:text-warm-gray underline"
          title="Ongedaan maken"
        >
          undo
        </button>
      </div>
    );
  }

  // Default: CONFIRMED — show action buttons
  return (
    <div className="flex items-center gap-1.5 no-print">
      <button
        onClick={handleMarkAttended}
        className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-eritrea-green px-2.5 py-1.5 rounded-lg hover:bg-eritrea-green/90 transition-colors"
      >
        <Check size={12} /> Aanwezig
      </button>
      <button
        onClick={handleMarkNoShow}
        className="inline-flex items-center gap-1 text-xs font-semibold text-eritrea-red bg-eritrea-red/10 px-2.5 py-1.5 rounded-lg hover:bg-eritrea-red/20 transition-colors"
      >
        <X size={12} /> Niet gekomen
      </button>
    </div>
  );
}
