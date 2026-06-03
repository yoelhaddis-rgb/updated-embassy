"use client";

import { useState } from "react";
import { XCircle, Loader2, AlertTriangle } from "lucide-react";
import { cancelAppointmentAction } from "@/app/actions/appointments";

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    const result = await cancelAppointmentAction(appointmentId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setConfirming(false);
    }
    // On success, page will revalidate automatically
  };

  if (confirming) {
    return (
      <div className="mt-3 bg-eritrea-red/5 border border-eritrea-red/20 rounded-xl p-3">
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle size={15} className="shrink-0 mt-0.5 text-eritrea-red" />
          <p className="text-xs text-charcoal/80 leading-relaxed">
            Weet u zeker dat u deze afspraak wilt annuleren? Dit kan niet ongedaan worden gemaakt.
          </p>
        </div>
        {error && <p className="text-xs text-eritrea-red mb-2">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-eritrea-red px-3 py-1.5 rounded-lg hover:bg-eritrea-red/90 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
            Ja, annuleer
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="text-xs text-warm-gray px-3 py-1.5 rounded-lg hover:bg-parchment transition-colors"
          >
            Nee, terug
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="mt-3 flex items-center gap-1.5 text-xs text-warm-gray hover:text-eritrea-red transition-colors"
    >
      <XCircle size={13} />
      Afspraak annuleren
    </button>
  );
}
