import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, Clock, CheckCircle, XCircle, User } from "lucide-react";

export default async function AdminAfsprakenPage() {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) redirect("/inloggen");

  const appointments = await db.appointment.findMany({
    include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, eritreanIdNumber: true } } },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });

  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter(a => a.date >= today && a.status === "CONFIRMED");
  const past = appointments.filter(a => a.date < today || a.status !== "CONFIRMED");

  function StatusBadge({ status }: { status: string }) {
    if (status === "CONFIRMED") return (
      <span className="flex items-center gap-1 text-eritrea-green text-xs font-semibold">
        <CheckCircle size={13} /> Bevestigd
      </span>
    );
    if (status === "CANCELLED") return (
      <span className="flex items-center gap-1 text-eritrea-red text-xs font-semibold">
        <XCircle size={13} /> Geannuleerd
      </span>
    );
    return <span className="text-warm-gray text-xs">{status}</span>;
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium text-white">Alle afspraken</h1>
            <p className="text-white/40 text-sm">{upcoming.length} aankomend · {past.length} verleden</p>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {/* Upcoming */}
        <div>
          <h2 className="font-display font-medium text-charcoal text-xl mb-4">Aankomende afspraken</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-8 text-center text-warm-gray">
              Geen aankomende afspraken
            </div>
          ) : (
            <div className="bg-white rounded-2xl ring-1 ring-stone/40 overflow-hidden">
              <table className="w-full">
                <thead className="bg-parchment/60 text-xs text-warm-gray uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Datum & Tijd</th>
                    <th className="px-6 py-3 text-left">Burger</th>
                    <th className="px-6 py-3 text-left">Dienst</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/30">
                  {upcoming.map(appt => (
                    <tr key={appt.id} className="hover:bg-parchment/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarCheck size={15} className="text-eritrea-blue shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-charcoal">
                              {new Date(appt.date + "T12:00:00").toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
                            </p>
                            <p className="text-xs text-warm-gray flex items-center gap-1"><Clock size={10} /> {appt.timeSlot} uur</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center text-xs font-bold shrink-0">
                            {appt.user.firstName[0]}{appt.user.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal">{appt.user.firstName} {appt.user.lastName}</p>
                            <p className="text-xs text-warm-gray">{appt.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-charcoal">{appt.serviceTitle}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={appt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="font-display font-medium text-charcoal text-xl mb-4 text-warm-gray/70">Afgelopen afspraken</h2>
            <div className="bg-white/60 rounded-2xl ring-1 ring-stone/30 overflow-hidden">
              <table className="w-full">
                <thead className="bg-parchment/40 text-xs text-warm-gray uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Datum & Tijd</th>
                    <th className="px-6 py-3 text-left">Burger</th>
                    <th className="px-6 py-3 text-left">Dienst</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/20">
                  {past.slice(0, 10).map(appt => (
                    <tr key={appt.id} className="opacity-60">
                      <td className="px-6 py-3">
                        <p className="text-xs text-charcoal">
                          {new Date(appt.date + "T12:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })} · {appt.timeSlot}
                        </p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-xs text-charcoal">{appt.user.firstName} {appt.user.lastName}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-xs text-charcoal">{appt.serviceTitle}</p>
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={appt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
