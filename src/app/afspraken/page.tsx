import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import AppointmentWizard from "@/components/AppointmentWizard";
import PageHeader from "@/components/PageHeader";
import { Clock, FileText, AlertCircle, CalendarCheck } from "lucide-react";

export default async function AfsprakenPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const [user, existingDocuments] = await Promise.all([
    db.user.findUnique({
      where: { id: session.id },
      select: { firstName: true, lastName: true, email: true, phone: true, dateOfBirth: true },
    }),
    db.document.findMany({
      where: { userId: session.id, reusable: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
    }),
  ]);

  const prefillData = {
    firstName: user?.firstName ?? session.firstName,
    lastName: user?.lastName ?? session.lastName,
    email: user?.email ?? session.email,
    phone: user?.phone ?? "",
    dateOfBirth: user?.dateOfBirth ?? "",
  };

  const serializedDocs = existingDocuments.map(doc => ({
    ...doc,
    createdAt: doc.createdAt.toISOString(),
  }));

  // Find next available booking date (first Mon–Thu with < 12 CONFIRMED appointments)
  const MAX_SLOTS_PER_DAY = 12;
  const todayDate = new Date();
  const workingDays: string[] = [];
  const tempDate = new Date(todayDate);
  while (workingDays.length < 60) {
    const dow = tempDate.getDay();
    if (dow >= 1 && dow <= 4) {   // Mon–Thu only
      workingDays.push(tempDate.toISOString().split("T")[0]);
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  const bookedCounts = await db.appointment.groupBy({
    by: ["date"],
    where: {
      date: { in: workingDays },
      status: "CONFIRMED",
    },
    _count: { id: true },
  });

  const bookedByDate = new Map(bookedCounts.map(r => [r.date, r._count.id]));
  const nextAvailableDate = workingDays.find(d => (bookedByDate.get(d) ?? 0) < MAX_SLOTS_PER_DAY) ?? null;
  const nextAvailableFormatted = nextAvailableDate
    ? new Date(nextAvailableDate + "T12:00:00").toLocaleDateString("nl-NL", {
        weekday: "long", day: "numeric", month: "long",
      })
    : null;

  return (
    <>
      <PageHeader titleKey="page.appointment.title" subtitleKey="page.appointment.subtitle" />
      <div className="eritrea-line" />

      <section className="bg-ivory pt-12 pb-24">
        <div className="max-w-4xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Clock, color: "text-eritrea-blue", bg: "bg-eritrea-blue/8", title: "Openingstijden", desc: "Ma – Do: 09:00 – 15:00, alleen op afspraak" },
              { icon: FileText, color: "text-eritrea-green", bg: "bg-eritrea-green/8", title: "Documenten", desc: "Upload vooraf of neem originelen mee" },
              { icon: AlertCircle, color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/10", title: "Let op", desc: "Elke persoon heeft een eigen afspraak nodig" },
            ].map((item) => (
              <div key={item.title} className="bg-parchment/60 rounded-2xl p-5 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="font-display font-medium text-charcoal text-sm">{item.title}</p>
                  <p className="text-warm-gray text-xs mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {nextAvailableFormatted && (
            <div className="max-w-3xl mx-auto px-8 pb-4">
              <div className="bg-eritrea-green/8 border border-eritrea-green/20 rounded-xl px-4 py-3 text-sm text-charcoal/80 flex items-center gap-2.5">
                <CalendarCheck size={15} className="text-eritrea-green shrink-0" />
                <span>
                  Vroegst beschikbare datum:{" "}
                  <strong className="text-charcoal capitalize">{nextAvailableFormatted}</strong>
                </span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg shadow-charcoal/5 ring-1 ring-stone/40">
            <AppointmentWizard
              prefillData={prefillData}
              existingDocuments={serializedDocs}
            />
          </div>
        </div>
      </section>
    </>
  );
}
