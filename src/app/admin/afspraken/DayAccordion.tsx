"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ApptRow {
  id: string;
  userId: string;
  timeSlot: string;
  serviceTitle: string;
  status: string;
  notes: string | null;
  walkIn: boolean;
  user: { firstName: string; lastName: string; phone: string | null };
}

interface DayGroup {
  date: string;
  formattedDate: string;
  appointments: ApptRow[];
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: "Bevestigd",    color: "text-eritrea-blue" },
  ATTENDED:  { label: "Aanwezig",     color: "text-eritrea-green" },
  NO_SHOW:   { label: "Niet gekomen", color: "text-eritrea-red" },
  CANCELLED: { label: "Geannuleerd",  color: "text-warm-gray/60" },
};

export function DayAccordion({
  groups,
  defaultOpenDate,
}: {
  groups: DayGroup[];
  defaultOpenDate?: string;
}) {
  const [openDates, setOpenDates] = useState<Set<string>>(
    new Set(defaultOpenDate ? [defaultOpenDate] : groups[0] ? [groups[0].date] : [])
  );

  const toggle = (date: string) => {
    setOpenDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-10 text-center text-warm-gray">
        Geen afspraken gevonden voor deze periode.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map(group => {
        const isOpen = openDates.has(group.date);
        const previewNames = group.appointments
          .filter(a => !a.walkIn)
          .slice(0, 3)
          .map(a => `${a.user.firstName} ${a.user.lastName[0] ?? ""}.`);
        const walkInCount = group.appointments.filter(a => a.walkIn).length;
        const extraCount = group.appointments.length - 3;

        return (
          <div key={group.date} className="bg-white rounded-2xl ring-1 ring-stone/40 overflow-hidden">
            <button
              onClick={() => toggle(group.date)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-parchment/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isOpen
                  ? <ChevronDown size={15} className="text-warm-gray shrink-0" />
                  : <ChevronRight size={15} className="text-warm-gray shrink-0" />}
                <div>
                  <p className="font-display font-semibold text-charcoal capitalize text-sm">
                    {group.formattedDate}
                  </p>
                  <p className="text-xs text-warm-gray mt-0.5">
                    {group.appointments.length} afspra{group.appointments.length === 1 ? "ak" : "ken"}
                    {walkInCount > 0 && ` · ${walkInCount} inloper${walkInCount > 1 ? "s" : ""}`}
                    {previewNames.length > 0 && (
                      <span className="ml-1">
                        · {previewNames.join(", ")}
                        {extraCount > 0 && ` +${extraCount}`}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Link
                href={`/admin/dagschema?date=${group.date}`}
                onClick={e => e.stopPropagation()}
                className="text-xs text-eritrea-blue hover:underline shrink-0 ml-4"
              >
                Dagschema →
              </Link>
            </button>

            {isOpen && (
              <div className="border-t border-stone/30">
                <table className="w-full">
                  <tbody className="divide-y divide-stone/20">
                    {group.appointments.map(appt => {
                      const sc = STATUS_STYLE[appt.status] ?? { label: appt.status, color: "text-warm-gray" };
                      return (
                        <tr key={appt.id} className="hover:bg-parchment/20 transition-colors">
                          <td className="px-6 py-3 w-16">
                            <span className="font-bold text-eritrea-blue text-sm">{appt.timeSlot}</span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center text-xs font-bold shrink-0">
                                {appt.walkIn
                                  ? "?"
                                  : `${appt.user.firstName[0] ?? ""}${appt.user.lastName[0] ?? ""}`}
                              </div>
                              <div>
                                {appt.walkIn ? (
                                  <p className="text-sm text-warm-gray italic">
                                    Inloper{appt.notes ? ` — ${appt.notes}` : ""}
                                  </p>
                                ) : (
                                  <Link
                                    href={`/admin/burgers/${appt.userId}`}
                                    className="text-sm font-medium text-charcoal hover:text-eritrea-blue transition-colors"
                                  >
                                    {appt.user.firstName} {appt.user.lastName}
                                  </Link>
                                )}
                                <p className="text-xs text-warm-gray">{appt.serviceTitle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className={`text-xs font-medium ${sc.color}`}>{sc.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
