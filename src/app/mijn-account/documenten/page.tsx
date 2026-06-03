import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CalendarCheck, Clock, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const statusConfig = {
  PENDING:  { label: "In behandeling", classes: "bg-eritrea-gold/15 text-eritrea-gold-dark", Icon: Clock },
  READY:    { label: "Klaar voor ophaling", classes: "bg-eritrea-green/10 text-eritrea-green", Icon: CheckCircle },
  REJECTED: { label: "Afgewezen", classes: "bg-eritrea-red/10 text-eritrea-red", Icon: XCircle },
} as const;

type DocStatus = keyof typeof statusConfig;

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

  const readyCount = documents.filter(d => d.status === "READY").length;

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
        {/* Ready for pickup callout */}
        {readyCount > 0 && (
          <div className="bg-eritrea-green/8 border border-eritrea-green/25 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle size={18} className="shrink-0 mt-0.5 text-eritrea-green" />
            <div>
              <p className="font-semibold text-charcoal text-sm">
                {readyCount === 1 ? "1 document klaar voor ophaling" : `${readyCount} documenten klaar voor ophaling`}
              </p>
              <p className="text-xs text-warm-gray mt-0.5">
                Kom langs tijdens openingstijden (ma–do 09:00–15:00) met een geldig identiteitsbewijs.
              </p>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
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

            {documents.map(doc => {
              const status = (doc.status ?? "PENDING") as DocStatus;
              const cfg = statusConfig[status] ?? statusConfig.PENDING;
              const StatusIcon = cfg.Icon;
              return (
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
                    {status === "REJECTED" && doc.statusNote && (
                      <p className="mt-2 text-xs text-eritrea-red/80 italic">{doc.statusNote}</p>
                    )}
                    {status === "READY" && (
                      <p className="mt-2 text-xs text-eritrea-green/80">
                        Kom langs: Javastraat 58, Den Haag · ma–do 09:00–15:00 · Neem geldig ID mee
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${cfg.classes}`}>
                    <StatusIcon size={11} />
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
