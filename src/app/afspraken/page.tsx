import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import AppointmentWizard from "@/components/AppointmentWizard";
import PageHeader from "@/components/PageHeader";
import { Clock, FileText, AlertCircle } from "lucide-react";

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
