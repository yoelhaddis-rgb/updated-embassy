import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, CalendarCheck, FileText,
  User, Users, Banknote, CheckCircle, AlertCircle,
} from "lucide-react";
import { DocumentStatusDropdown } from "./DocumentStatusDropdown";
import { TaxPaymentForm } from "./TaxPaymentForm";

export default async function BurgerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) redirect("/inloggen");

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      appointments: { orderBy: { date: "desc" }, take: 10 },
      documents: { orderBy: { createdAt: "desc" } },
      familyMembers: { orderBy: { createdAt: "asc" } },
      taxPayments: { orderBy: { year: "desc" } },
    },
  });

  if (!user || user.role !== "CITIZEN") notFound();

  const currentYear = new Date().getFullYear();

  // Build a year range to display: from earliest payment or 3 years ago, up to next year
  const paidYears = new Set(user.taxPayments.map((p) => p.year));
  const earliestPaid = user.taxPayments.length > 0
    ? Math.min(...user.taxPayments.map((p) => p.year))
    : null;
  const displayFrom = earliestPaid ? Math.min(earliestPaid, currentYear - 1) : currentYear - 1;
  const displayTo = currentYear + 1;
  const yearRange: number[] = [];
  for (let y = displayTo; y >= displayFrom; y--) yearRange.push(y);

  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-navy px-8 py-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/admin/burgers" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-eritrea-blue/20 text-eritrea-gold flex items-center justify-center text-lg font-display font-bold shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-white/40 text-sm">
                {user.eritreanIdNumber ? `ID: ${user.eritreanIdNumber} · ` : ""}
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Identity + Family ── */}
        <div className="space-y-5">

          {/* Personal info */}
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
            <h2 className="font-display font-medium text-charcoal text-base mb-4 flex items-center gap-2">
              <User size={16} className="text-eritrea-blue" /> Persoonsgegevens
            </h2>
            <div className="space-y-2.5 text-sm">
              {[
                { label: "Voornaam", value: user.firstName },
                { label: "Achternaam", value: user.lastName },
                { label: "Geboortedatum", value: user.dateOfBirth ?? "—" },
                { label: "Nationaliteit", value: user.nationality ?? "—" },
                { label: "Adres", value: user.address ?? "—" },
                { label: "Telefoon", value: user.phone ?? "—" },
                { label: "Eritrees ID", value: user.eritreanIdNumber ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="text-warm-gray shrink-0">{label}</span>
                  <span className="font-medium text-charcoal text-right break-all">{value}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 pt-1 text-xs text-warm-gray border-t border-stone/30 mt-2">
                <Mail size={11} /> {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center gap-1.5 text-xs text-warm-gray">
                  <Phone size={11} /> {user.phone}
                </div>
              )}
            </div>
          </div>

          {/* Family */}
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
            <h2 className="font-display font-medium text-charcoal text-base mb-4 flex items-center gap-2">
              <Users size={16} className="text-eritrea-green" /> Familieleden
              <span className="text-xs text-warm-gray font-normal">({user.familyMembers.length})</span>
            </h2>
            {user.familyMembers.length === 0 ? (
              <p className="text-sm text-warm-gray">Geen familieleden toegevoegd</p>
            ) : (
              <div className="space-y-3">
                {user.familyMembers.map((fm) => (
                  <div key={fm.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-eritrea-green/10 text-eritrea-green flex items-center justify-center text-xs font-bold shrink-0">
                      {fm.firstName[0]}{fm.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal">{fm.firstName} {fm.lastName}</p>
                      <p className="text-xs text-warm-gray capitalize">{fm.relationship}{fm.dateOfBirth ? ` · geb. ${fm.dateOfBirth}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered */}
          <p className="text-xs text-warm-gray px-1">
            Geregistreerd op {new Date(user.createdAt).toLocaleDateString("nl-NL", { dateStyle: "long" })}
          </p>
        </div>

        {/* ── RIGHT: Tax + Documents + Appointments ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* 2% Belasting */}
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-medium text-charcoal text-lg flex items-center gap-2">
                <Banknote size={18} className="text-eritrea-gold-dark" /> 2% Rehabilitatiebelasting
              </h2>
              <TaxPaymentForm userId={user.id} />
            </div>

            {user.taxPayments.length === 0 ? (
              <p className="text-sm text-warm-gray">Nog geen betalingen geregistreerd</p>
            ) : (
              <div className="space-y-2">
                {yearRange.map((year) => {
                  const payment = user.taxPayments.find((p) => p.year === year);
                  return (
                    <div
                      key={year}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                        payment ? "bg-eritrea-green/5" : year <= currentYear ? "bg-eritrea-red/4" : "bg-parchment/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {payment ? (
                          <CheckCircle size={16} className="text-eritrea-green shrink-0" />
                        ) : year <= currentYear ? (
                          <AlertCircle size={16} className="text-warm-gray/40 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-stone/40 shrink-0" />
                        )}
                        <span className={`font-display font-semibold text-sm ${payment ? "text-charcoal" : "text-warm-gray"}`}>
                          {year}
                        </span>
                      </div>
                      {payment ? (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-eritrea-green">
                            € {payment.amountPaid.toFixed(2)}
                          </p>
                          <p className="text-xs text-warm-gray">
                            {new Date(payment.paidAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                            {payment.registeredByName && ` · ${payment.registeredByName}`}
                          </p>
                          {payment.notes && (
                            <p className="text-xs text-warm-gray/60 italic mt-0.5">{payment.notes}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-warm-gray/50">
                          {year > currentYear ? "Toekomstig jaar" : "Niet betaald"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
            <h2 className="font-display font-medium text-charcoal text-lg mb-4 flex items-center gap-2">
              <FileText size={18} className="text-eritrea-gold-dark" /> Documenten
              <span className="text-sm text-warm-gray font-normal">({user.documents.length})</span>
            </h2>
            {user.documents.length === 0 ? (
              <p className="text-sm text-warm-gray">Geen documenten geüpload</p>
            ) : (
              <div className="space-y-2">
                {user.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-parchment/30 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">{doc.originalName}</p>
                      <p className="text-xs text-warm-gray">
                        {(doc.size / 1024).toFixed(0)} KB · {new Date(doc.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <DocumentStatusDropdown documentId={doc.id} currentStatus={doc.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
            <h2 className="font-display font-medium text-charcoal text-lg mb-4 flex items-center gap-2">
              <CalendarCheck size={18} className="text-eritrea-blue" /> Afspraken
              <span className="text-sm text-warm-gray font-normal">({user.appointments.length})</span>
            </h2>
            {user.appointments.length === 0 ? (
              <p className="text-sm text-warm-gray">Geen afspraken</p>
            ) : (
              <div className="divide-y divide-stone/30">
                {user.appointments.map((appt) => (
                  <div key={appt.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{appt.serviceTitle}</p>
                      <p className="text-xs text-warm-gray mt-0.5">
                        {new Date(appt.date + "T12:00:00").toLocaleDateString("nl-NL", { dateStyle: "medium" })} · {appt.timeSlot} uur
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        appt.status === "CONFIRMED" ? "bg-eritrea-green/10 text-eritrea-green"
                        : appt.status === "ATTENDED" ? "bg-eritrea-blue/10 text-eritrea-blue"
                        : appt.status === "CANCELLED" ? "bg-eritrea-red/10 text-eritrea-red"
                        : "bg-parchment text-warm-gray"
                      }`}>
                        {appt.status === "CONFIRMED" ? "Bevestigd"
                          : appt.status === "ATTENDED" ? "Aanwezig"
                          : appt.status === "CANCELLED" ? "Geannuleerd"
                          : "Niet gekomen"}
                      </span>
                      {appt.paymentStatus !== "NONE" && (
                        <span className={`text-xs px-2.5 py-1 rounded-lg ${
                          appt.paymentStatus === "PAID" ? "bg-eritrea-green/10 text-eritrea-green"
                          : appt.paymentStatus === "PENDING" ? "bg-eritrea-gold/15 text-eritrea-gold-dark"
                          : "bg-eritrea-blue/10 text-eritrea-blue"
                        }`}>
                          {appt.paymentStatus === "PAID" ? "Betaald"
                            : appt.paymentStatus === "PENDING" ? "Te betalen"
                            : "Vrijgesteld"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
