import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CalendarCheck } from "lucide-react";

export default async function DocumentenPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const documents = await db.document.findMany({
    where: { userId: session.id },
    include: {
      appointment: { select: { serviceTitle: true, date: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = documents.map(doc => ({
    ...doc,
    createdAt: doc.createdAt.toISOString(),
    appointment: doc.appointment
      ? { serviceTitle: doc.appointment.serviceTitle, date: doc.appointment.date }
      : null,
  }));

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/mijn-account" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium text-white">Mijn documenten</h1>
            <p className="text-white/40 text-sm">{documents.length} bestanden opgeslagen</p>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-2xl mx-auto px-8 py-10 space-y-4">
        {serialized.length === 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-10 text-center">
            <FileText size={32} className="mx-auto text-warm-gray/30 mb-3" />
            <p className="text-warm-gray text-sm mb-4">Nog geen documenten geüpload.</p>
            <Link href="/afspraken" className="btn-primary inline-flex text-sm">
              Afspraak maken &amp; uploaden
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-eritrea-gold/8 border border-eritrea-gold/20 rounded-xl p-4 text-sm text-charcoal/70 flex items-start gap-3">
              <FileText size={16} className="shrink-0 mt-0.5 text-eritrea-gold-dark" />
              <p>Documenten gemarkeerd als <strong>herbruikbaar</strong> worden automatisch aangeboden bij een nieuwe afspraak.</p>
            </div>

            {serialized.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl ring-1 ring-stone/40 p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-eritrea-blue/8 text-eritrea-blue flex items-center justify-center shrink-0">
                  <FileText size={20} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal truncate">{doc.originalName}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-warm-gray">
                    <span>{(doc.size / 1024).toFixed(0)} KB</span>
                    <span>·</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString("nl-NL", { dateStyle: "medium" })}</span>
                    {doc.reusable && (
                      <span className="text-eritrea-green font-medium">· Herbruikbaar</span>
                    )}
                  </div>
                  {doc.appointment && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-warm-gray/70">
                      <CalendarCheck size={12} />
                      {doc.appointment.serviceTitle} · {new Date(doc.appointment.date + "T12:00:00").toLocaleDateString("nl-NL", { dateStyle: "medium" })}
                    </div>
                  )}
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                  doc.reusable ? "bg-eritrea-green/10 text-eritrea-green" : "bg-parchment text-warm-gray"
                }`}>
                  {doc.reusable ? "Herbruikbaar" : "Eenmalig"}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
