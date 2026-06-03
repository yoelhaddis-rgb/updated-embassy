import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, Clock, MapPin, FileText, CheckCircle } from "lucide-react";
import { getServiceInfo } from "@/lib/services";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function AfspraakBevestigingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const { id } = await params;

  const appointment = await db.appointment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          eritreanIdNumber: true,
        },
      },
    },
  });

  // Only allow the citizen who owns this appointment
  if (!appointment || appointment.userId !== session.id) notFound();

  const serviceInfo = getServiceInfo(appointment.serviceId);

  const formattedDate = new Date(appointment.date + "T12:00:00").toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isCancelled = appointment.status === "CANCELLED";
  const isPast = new Date(appointment.date + "T23:59:00") < new Date();

  return (
    <>
      {/* Screen-only navigation */}
      <div className="no-print bg-navy px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/mijn-account" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Terug naar mijn account
          </Link>
          <PrintButton />
        </div>
      </div>
      <div className="no-print eritrea-line" />

      {/* Printable content */}
      <div className="bg-ivory min-h-screen print:bg-white">
        <div className="max-w-2xl mx-auto px-8 py-10 print:px-4 print:py-4">

          {/* Print header */}
          <div className="hidden print:flex items-center gap-4 mb-8 pb-6 border-b-2 border-navy">
            <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center shrink-0">
              {/* Embassy logo placeholder */}
              <span className="text-eritrea-gold text-2xl font-bold">🇪🇷</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy">Eritrese Ambassade Den Haag</h1>
              <p className="text-sm text-gray-600">Javastraat 58 · 2585 AR Den Haag · +31 70 427 6812</p>
              <p className="text-sm text-gray-600">info@eritreanembassy.nl</p>
            </div>
          </div>

          {/* Status badge */}
          {isCancelled && (
            <div className="no-print mb-6 bg-eritrea-red/8 border border-eritrea-red/20 rounded-2xl p-4 text-center">
              <p className="text-eritrea-red font-semibold">Deze afspraak is geannuleerd</p>
            </div>
          )}

          {/* Main confirmation card */}
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 print:ring-0 print:border print:border-gray-300 overflow-hidden">

            {/* Header stripe */}
            <div className="bg-navy px-8 py-6 print:py-4 text-white">
              <div className="flex items-center gap-3 mb-1">
                <CheckCircle size={20} className="text-eritrea-gold shrink-0" />
                <span className="text-eritrea-gold text-sm font-semibold uppercase tracking-wide">
                  Afspraakbevestiging
                </span>
              </div>
              <h2 className="font-display text-2xl print:text-xl font-medium mt-1">
                {appointment.serviceTitle}
              </h2>
            </div>

            <div className="p-8 print:p-6 space-y-6">

              {/* Date / time / location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center shrink-0">
                    <CalendarCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-warm-gray uppercase tracking-wide font-semibold mb-0.5">Datum</p>
                    <p className="font-display font-semibold text-charcoal capitalize text-sm leading-tight">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-eritrea-green/10 text-eritrea-green flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-warm-gray uppercase tracking-wide font-semibold mb-0.5">Tijd</p>
                    <p className="font-display font-semibold text-charcoal text-sm">{appointment.timeSlot} uur</p>
                    <p className="text-xs text-warm-gray">Wees op tijd aanwezig</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-eritrea-gold/15 text-eritrea-gold-dark flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-warm-gray uppercase tracking-wide font-semibold mb-0.5">Locatie</p>
                    <p className="font-semibold text-charcoal text-sm">Javastraat 58</p>
                    <p className="text-xs text-warm-gray">2585 AR Den Haag</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-stone/30 pt-6">
                {/* Personal details */}
                <h3 className="text-xs font-semibold uppercase tracking-wider text-warm-gray/60 mb-3">Uw gegevens</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  {[
                    { label: "Naam", value: `${appointment.user.firstName} ${appointment.user.lastName}` },
                    { label: "E-mail", value: appointment.user.email },
                    { label: "Telefoon", value: appointment.user.phone ?? "—" },
                    { label: "Geboortedatum", value: appointment.user.dateOfBirth ?? "—" },
                    ...(appointment.user.eritreanIdNumber
                      ? [{ label: "Eritrees ID", value: appointment.user.eritreanIdNumber }]
                      : []),
                    { label: "Referentienummer", value: appointment.id.slice(0, 12).toUpperCase() },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between border-b border-stone/20 py-1.5">
                      <span className="text-warm-gray">{label}</span>
                      <span className="font-medium text-charcoal text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required documents */}
              {serviceInfo && serviceInfo.requiredDocs.length > 0 && (
                <div className="border-t border-stone/30 pt-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-3">
                    <FileText size={15} className="text-eritrea-gold-dark" />
                    Neem mee naar de ambassade
                  </h3>
                  <ul className="space-y-2">
                    {serviceInfo.requiredDocs.map((doc) => (
                      <li key={doc} className="flex items-start gap-2.5 text-sm">
                        <div className="w-5 h-5 border-2 border-stone/40 rounded print:border-gray-500 shrink-0 mt-0.5 flex items-center justify-center">
                          <span className="text-[10px] text-warm-gray/40">✓</span>
                        </div>
                        <span className="text-charcoal">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              {appointment.notes && (
                <div className="border-t border-stone/30 pt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-warm-gray/60 mb-2">Opmerkingen</h3>
                  <p className="text-sm text-charcoal italic">{appointment.notes}</p>
                </div>
              )}

              {/* Important notice */}
              <div className="border-t border-stone/30 pt-6">
                <div className="bg-eritrea-gold/8 border border-eritrea-gold/25 rounded-xl p-4 text-sm text-charcoal/80">
                  <p className="font-semibold text-charcoal mb-1">Belangrijk</p>
                  <ul className="space-y-1 list-disc list-inside text-xs text-warm-gray">
                    <li>Kom <strong>op tijd</strong> — te laat aanmelden kan uw afspraak doen vervallen</li>
                    <li>Neem alle vereiste documenten mee (zie lijst hierboven)</li>
                    <li>Afspraken annuleren kan via uw account op <strong>eritreanembassy.nl</strong></li>
                    <li>Vragen? Bel <strong>+31 70 427 6812</strong> (ma–vr, 15:00–16:45)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Print footer */}
          <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-400">
            <p>Eritrese Ambassade Den Haag · www.eritreanembassy.nl · Afgedrukt op {new Date().toLocaleDateString("nl-NL", { dateStyle: "long" })}</p>
          </div>

          {/* Screen-only actions */}
          <div className="no-print mt-6 flex gap-3">
            <Link href="/mijn-account" className="btn-primary flex items-center gap-2 text-sm">
              <ArrowLeft size={15} /> Terug
            </Link>
            {!isCancelled && !isPast && (
              <Link href="/mijn-account" className="text-sm text-eritrea-blue hover:underline flex items-center gap-1 ml-auto">
                Afspraak wijzigen of annuleren
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>
    </>
  );
}
