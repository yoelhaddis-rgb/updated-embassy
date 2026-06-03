import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import {
  User, CalendarCheck, FileText, Users, LogOut,
  Clock, CheckCircle, XCircle, ChevronRight, Plus, Banknote, Printer,
} from "lucide-react";
import { CancelAppointmentButton } from "@/components/CancelAppointmentButton";
import { RescheduleButton } from "@/components/RescheduleButton";

export default async function MijnAccountPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const user = await db.user.findUnique({
    where: { id: session.id },
    include: {
      appointments: { orderBy: { createdAt: "desc" }, take: 5 },
      documents: { orderBy: { createdAt: "desc" }, take: 5 },
      familyMembers: true,
      taxPayments: { orderBy: { year: "desc" } },
    },
  });

  if (!user) redirect("/inloggen");

  const upcomingAppointments = user.appointments.filter(a => {
    const apptDate = new Date(a.date + "T" + a.timeSlot);
    return apptDate >= new Date() && a.status === "CONFIRMED";
  });

  const pastAppointments = user.appointments.filter(a => {
    const apptDate = new Date(a.date + "T" + a.timeSlot);
    return apptDate < new Date() || a.status !== "CONFIRMED";
  });

  const readyDocuments = user.documents.filter(d => d.status === "READY");

  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="gradient-hero-dark">
        <div className="absolute top-0 left-0 right-0 flag-bar"><div /><div /><div /></div>
        <div className="max-w-6xl mx-auto px-8 pt-16 pb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-eritrea-blue/20 text-eritrea-gold flex items-center justify-center text-2xl font-display font-bold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <h1 className="font-display text-2xl font-medium text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-white/50 text-sm mt-0.5">{user.email}</p>
                {user.eritreanIdNumber && (
                  <p className="text-eritrea-gold/70 text-xs mt-1 font-mono">ID: {user.eritreanIdNumber}</p>
                )}
              </div>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
                <LogOut size={16} /> Uitloggen
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
            {[
              { value: upcomingAppointments.length, label: "Komende afspraken" },
              { value: user.documents.length, label: "Documenten" },
              { value: user.familyMembers.length, label: "Familieleden" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-display font-medium text-white">{s.value}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="eritrea-line" />

      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Quick actions */}
        <div className="space-y-4">
          <h2 className="font-display font-medium text-charcoal text-lg">Snelle acties</h2>

          <Link href="/afspraken" className="flex items-center gap-4 p-5 bg-eritrea-red text-white rounded-2xl hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-eritrea-red/20">
            <CalendarCheck size={22} />
            <div>
              <p className="font-semibold text-sm">Afspraak maken</p>
              <p className="text-white/70 text-xs">Plan een bezoek</p>
            </div>
            <ChevronRight size={18} className="ml-auto" />
          </Link>

          <Link href="/mijn-account/profiel" className="flex items-center gap-4 p-5 bg-white rounded-2xl hover:-translate-y-0.5 transition-all ring-1 ring-stone/40">
            <User size={20} className="text-eritrea-blue" />
            <div>
              <p className="font-semibold text-charcoal text-sm">Mijn profiel</p>
              <p className="text-warm-gray text-xs">Gegevens bewerken</p>
            </div>
            <ChevronRight size={18} className="ml-auto text-warm-gray/50" />
          </Link>

          <Link href="/mijn-account/familie" className="flex items-center gap-4 p-5 bg-white rounded-2xl hover:-translate-y-0.5 transition-all ring-1 ring-stone/40">
            <Users size={20} className="text-eritrea-green" />
            <div>
              <p className="font-semibold text-charcoal text-sm">Familieleden</p>
              <p className="text-warm-gray text-xs">{user.familyMembers.length} personen toegevoegd</p>
            </div>
            <ChevronRight size={18} className="ml-auto text-warm-gray/50" />
          </Link>

          <Link href="/mijn-account/documenten" className="flex items-center gap-4 p-5 bg-white rounded-2xl hover:-translate-y-0.5 transition-all ring-1 ring-stone/40">
            <FileText size={20} className="text-eritrea-gold-dark" />
            <div>
              <p className="font-semibold text-charcoal text-sm">Mijn documenten</p>
              <p className="text-warm-gray text-xs">{user.documents.length} bestanden opgeslagen</p>
            </div>
            <ChevronRight size={18} className="ml-auto text-warm-gray/50" />
          </Link>

          {/* Profile summary */}
          <div className="bg-parchment/60 rounded-2xl p-5 space-y-2.5 mt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-warm-gray/60 mb-3">Uw gegevens</h3>
            {[
              { label: "Geboortedatum", value: user.dateOfBirth || "—" },
              { label: "Telefoon", value: user.phone || "—" },
              { label: "Nationaliteit", value: user.nationality || "Eritrees" },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-warm-gray">{item.label}</span>
                <span className="font-medium text-charcoal">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Tax + Appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ready documents callout */}
          {readyDocuments.length > 0 && (
            <div className="bg-eritrea-green/8 border border-eritrea-green/25 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle size={18} className="shrink-0 text-eritrea-green" />
              <div className="flex-1">
                <p className="font-semibold text-charcoal text-sm">
                  {readyDocuments.length === 1
                    ? "1 document klaar voor ophaling"
                    : `${readyDocuments.length} documenten klaar voor ophaling`}
                </p>
                <p className="text-xs text-warm-gray mt-0.5">
                  Bezoek de ambassade ma–do 09:00–15:00 met een geldig identiteitsbewijs.
                </p>
              </div>
              <Link href="/mijn-account/documenten" className="text-xs font-semibold text-eritrea-green hover:underline shrink-0">
                Bekijken →
              </Link>
            </div>
          )}

          {/* 2% Belasting */}
          {user.taxPayments.length > 0 && (
            <div>
              <h2 className="font-display font-medium text-charcoal text-lg mb-4 flex items-center gap-2">
                <Banknote size={18} className="text-eritrea-gold-dark" />
                2% Rehabilitatiebelasting
              </h2>
              <div className="bg-white rounded-2xl ring-1 ring-stone/40 divide-y divide-stone/30">
                {user.taxPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={15} className="text-eritrea-green shrink-0" />
                      <span className="font-display font-semibold text-sm text-charcoal">{payment.year}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-eritrea-green">
                        € {payment.amountPaid.toFixed(2)}
                      </p>
                      <p className="text-xs text-warm-gray">
                        {new Date(payment.paidAt).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-medium text-charcoal text-lg">Komende afspraken</h2>
              <Link href="/afspraken" className="text-eritrea-blue text-sm font-medium flex items-center gap-1 hover:underline">
                <Plus size={14} /> Nieuwe afspraak
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-8 text-center">
                <CalendarCheck size={32} className="mx-auto text-warm-gray/30 mb-3" />
                <p className="text-warm-gray text-sm">Geen komende afspraken</p>
                <Link href="/afspraken" className="btn-red text-sm inline-flex mt-4">
                  Afspraak maken
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map(appt => (
                  <div key={appt.id} className="bg-white rounded-2xl ring-1 ring-stone/40 p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-eritrea-blue/8 text-eritrea-blue flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] uppercase font-semibold">
                        {new Date(appt.date + "T12:00:00").toLocaleDateString("nl-NL", { month: "short" })}
                      </span>
                      <span className="text-lg font-display font-bold leading-tight">
                        {new Date(appt.date + "T12:00:00").getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-medium text-charcoal">{appt.serviceTitle}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-warm-gray">
                        <Clock size={12} /> {appt.timeSlot} uur
                        <span className="flex items-center gap-1 text-eritrea-green">
                          <CheckCircle size={12} /> Bevestigd
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Link
                          href={`/mijn-account/afspraken/${appt.id}`}
                          className="flex items-center gap-1.5 text-xs text-eritrea-blue hover:underline font-medium"
                        >
                          <Printer size={12} /> Bevestiging afdrukken
                        </Link>
                      </div>
                      <RescheduleButton
                        appointmentId={appt.id}
                        currentDate={appt.date}
                        currentTimeSlot={appt.timeSlot}
                      />
                      <CancelAppointmentButton appointmentId={appt.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h2 className="font-display font-medium text-charcoal text-lg mb-4">Afspraakhistorie</h2>
              <div className="space-y-2">
                {pastAppointments.slice(0, 3).map(appt => (
                  <div key={appt.id} className="bg-white/60 rounded-xl ring-1 ring-stone/30 p-4 flex items-center gap-4">
                    <XCircle size={18} className="text-warm-gray/40 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">{appt.serviceTitle}</p>
                      <p className="text-xs text-warm-gray">
                        {new Date(appt.date + "T12:00:00").toLocaleDateString("nl-NL", { dateStyle: "long" })} · {appt.timeSlot}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
