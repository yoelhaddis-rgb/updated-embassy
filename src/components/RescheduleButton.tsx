"use client";

import { useState } from "react";
import { CalendarDays, Loader2, X, Check } from "lucide-react";
import { rescheduleAppointmentAction } from "@/app/actions/appointments";
import { getAvailableSlots } from "@/app/actions/appointments";

const ALL_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
];

// Returns true if the date is a valid working day (Mon-Thu) and not in the past
function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return false;
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  return day >= 1 && day <= 4; // Mon-Thu only
}

// Get today's date string
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// Minimum date = tomorrow (can't reschedule same day)
function minDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function RescheduleButton({
  appointmentId,
  currentDate,
  currentTimeSlot,
}: {
  appointmentId: string;
  currentDate: string;
  currentTimeSlot: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot("");
    setAvailableSlots([]);
    if (!date || !isValidDate(date)) return;
    setLoadingSlots(true);
    try {
      const booked = await getAvailableSlots(date);
      const free = ALL_SLOTS.filter((s) => !booked.includes(s));
      setAvailableSlots(free);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setError("");
    const result = await rescheduleAppointmentAction(appointmentId, selectedDate, selectedSlot);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setDone(true);
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs text-eritrea-green font-medium">
        <Check size={13} /> Afspraak verzet naar {selectedDate} om {selectedSlot} uur
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 flex items-center gap-1.5 text-xs text-eritrea-blue hover:underline font-medium"
      >
        <CalendarDays size={13} /> Afspraak verzetten
      </button>
    );
  }

  return (
    <div className="mt-3 bg-parchment/50 rounded-xl p-4 border border-stone/40">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-charcoal">Nieuwe datum & tijd kiezen</p>
        <button onClick={() => { setOpen(false); setError(""); }} className="text-warm-gray hover:text-charcoal">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Date picker */}
        <div>
          <label className="block text-xs text-warm-gray mb-1">Datum (ma – do)</label>
          <input
            type="date"
            min={minDateStr()}
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="form-input !text-sm !py-2 w-full"
          />
          {selectedDate && !isValidDate(selectedDate) && (
            <p className="text-xs text-eritrea-red mt-1">
              De ambassade is alleen open op maandag t/m donderdag.
            </p>
          )}
        </div>

        {/* Time slot picker */}
        {selectedDate && isValidDate(selectedDate) && (
          <div>
            <label className="block text-xs text-warm-gray mb-2">Tijdstip</label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-xs text-warm-gray">
                <Loader2 size={12} className="animate-spin" /> Beschikbaarheid laden...
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-xs text-eritrea-red">Geen beschikbare tijdsloten op deze dag.</p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`text-xs py-1.5 rounded-lg font-medium transition-colors ${
                      selectedSlot === slot
                        ? "bg-eritrea-blue text-white"
                        : "bg-white ring-1 ring-stone/50 text-charcoal hover:ring-eritrea-blue"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-eritrea-red bg-eritrea-red/5 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Submit */}
        {selectedSlot && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full btn-red !text-xs !py-2 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 size={13} className="animate-spin" /> Verwerken...</>
            ) : (
              <>Verzet naar {selectedDate} · {selectedSlot} uur</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
