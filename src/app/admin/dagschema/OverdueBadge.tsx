"use client";

import { useEffect, useState } from "react";

export function OverdueBadge({
  date,
  timeSlot,
  status,
}: {
  date: string;       // "2026-05-29"
  timeSlot: string;   // "10:00"
  status: string;
}) {
  const [minutesLate, setMinutesLate] = useState<number | null>(null);

  useEffect(() => {
    function compute() {
      if (status !== "CONFIRMED") {
        setMinutesLate(null);
        return;
      }
      const [h, m] = timeSlot.split(":").map(Number);
      const apptTime = new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
      const diff = Math.floor((Date.now() - apptTime.getTime()) / 60000);
      setMinutesLate(diff > 0 ? diff : null);
    }

    compute();
    const interval = setInterval(compute, 30000); // re-check every 30s
    return () => clearInterval(interval);
  }, [date, timeSlot, status]);

  if (minutesLate === null) return null;

  return (
    <span className="ml-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded no-print">
      +{minutesLate}min
    </span>
  );
}
