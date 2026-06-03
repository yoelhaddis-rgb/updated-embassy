import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CheckInButton } from "./CheckInButton";
import { PrintButton } from "./PrintButton";
import { WalkInForm } from "./WalkInForm";

export default async function DagschemaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    redirect("/inloggen");
  }

  const { date } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = date ?? today;

  const appointments = await db.appointment.findMany({
    where: { date: selectedDate, status: { in: ["CONFIRMED", "ATTENDED", "NO_SHOW"] } },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true, phone: true, eritreanIdNumber: true },
      },
    },
    orderBy: { timeSlot: "asc" },
  });

  const formattedDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Prev/next working day links
  const prevDay = getPrevWorkday(selectedDate);
  const nextDay = getNextWorkday(selectedDate);

  return (
    <>
      {/* Print controls — hidden when printing */}
      <div className="no-print bg-navy px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href={`/admin/dagschema?date=${prevDay}`} className="text-white/60 hover:text-white text-sm">← Vorige dag</a>
            <h1 className="text-white font-semibold">{formattedDate}</h1>
            <a href={`/admin/dagschema?date=${nextDay}`} className="text-white/60 hover:text-white text-sm">Volgende dag →</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-white/60 hover:text-white text-sm">← Terug</a>
            <WalkInForm date={selectedDate} />
            <PrintButton />
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-4xl mx-auto px-8 py-8 print:px-4 print:py-2">

        {/* Header for print */}
        <div className="print-only hidden print:block mb-6 text-center border-b-2 border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Eritrese Ambassade – Dagschema</h1>
          <p className="text-lg text-gray-700 mt-1 capitalize">{formattedDate}</p>
          <p className="text-sm text-gray-500 mt-1">Afgedrukt op: {new Date().toLocaleDateString("nl-NL", { dateStyle: "long" })}</p>
        </div>

        {/* Stats row */}
        <div className="no-print flex gap-4 mb-6">
          <div className="bg-eritrea-blue/10 rounded-xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-eritrea-blue">{appointments.length}</div>
            <div className="text-xs text-warm-gray">Afspraken vandaag</div>
          </div>
          <div className="bg-eritrea-green/10 rounded-xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-eritrea-green">{appointments.length > 0 ? appointments[0].timeSlot : "–"}</div>
            <div className="text-xs text-warm-gray">Eerste afspraak</div>
          </div>
          <div className="bg-eritrea-gold/15 rounded-xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-eritrea-gold-dark">{appointments.length > 0 ? appointments[appointments.length - 1].timeSlot : "–"}</div>
            <div className="text-xs text-warm-gray">Laatste afspraak</div>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-12 text-center">
            <p className="text-warm-gray text-lg">Geen afspraken op {formattedDate}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 print:ring-0 print:rounded-none overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-navy text-white print:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-20">Tijd</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Naam</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Dienst</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden print:table-cell">Telefoon</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-24 print:w-32">Aanwezig</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/30 print:divide-gray-300">
                {appointments.map((appt, i) => (
                  <tr key={appt.id} className={`${i % 2 === 0 ? "bg-white print:bg-white" : "bg-parchment/30 print:bg-gray-50"} ${appt.walkIn ? "border-l-4 border-eritrea-gold" : ""}`}>
                    <td className="px-4 py-4 print:py-3">
                      <span className="font-bold text-eritrea-blue print:text-gray-900 text-sm">{appt.timeSlot}</span>
                    </td>
                    <td className="px-4 py-4 print:py-3">
                      <p className="font-semibold text-charcoal print:text-gray-900 text-sm flex items-center gap-2">
                        {appt.user.firstName} {appt.user.lastName}
                        {appt.walkIn && (
                          <span className="text-[10px] font-semibold text-eritrea-gold-dark bg-eritrea-gold/15 px-1.5 py-0.5 rounded">
                            Inloper
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-warm-gray print:text-gray-500 mt-0.5">
                        {appt.user.email}
                        {appt.user.eritreanIdNumber && (
                          <span className="ml-2 font-mono">ID: {appt.user.eritreanIdNumber}</span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-4 print:py-3">
                      <p className="text-sm text-charcoal print:text-gray-900">{appt.serviceTitle}</p>
                      {appt.notes && (
                        <p className="text-xs text-warm-gray print:text-gray-500 mt-0.5 italic">{appt.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 print:py-3 hidden print:table-cell">
                      <p className="text-xs text-gray-700">{appt.user.phone ?? "–"}</p>
                    </td>
                    <td className="px-4 py-4 print:py-3">
                      {/* Print: checkbox */}
                      <div className="hidden print:flex items-center gap-2">
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                          appt.status === "ATTENDED" ? "border-gray-800 bg-gray-800" : "border-gray-400"
                        }`}>
                          {appt.status === "ATTENDED" && <span className="text-white text-[10px]">✓</span>}
                        </div>
                      </div>
                      {/* Screen: live buttons */}
                      <div className="no-print">
                        <CheckInButton appointmentId={appt.id} initialStatus={appt.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature line for print */}
            <div className="hidden print:block px-4 py-6 border-t border-gray-300 mt-2">
              <div className="flex justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-6">Medewerker handtekening:</div>
                  <div className="border-b border-gray-800 w-48"></div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Totaal aanwezig: ____ / {appointments.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>
    </>
  );
}

function getPrevWorkday(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  do { d.setDate(d.getDate() - 1); } while (d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6);
  return d.toISOString().split("T")[0];
}

function getNextWorkday(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6);
  return d.toISOString().split("T")[0];
}
