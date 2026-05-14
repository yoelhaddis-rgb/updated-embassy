import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, User, Mail } from "lucide-react";

export default async function AdminMedewerkersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin");

  const staff = await db.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium text-white">Medewerkers beheren</h1>
            <p className="text-white/40 text-sm">{staff.length} medewerkers</p>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-white rounded-2xl ring-1 ring-stone/40 divide-y divide-stone/30">
          {staff.map(member => (
            <div key={member.id} className="flex items-center gap-5 px-6 py-5">
              <div className="w-12 h-12 rounded-full bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center font-bold shrink-0">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-charcoal">{member.firstName} {member.lastName}</p>
                <p className="text-sm text-warm-gray flex items-center gap-1.5 mt-0.5">
                  <Mail size={12} /> {member.email}
                </p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                member.role === "ADMIN"
                  ? "bg-eritrea-red/10 text-eritrea-red"
                  : "bg-eritrea-blue/10 text-eritrea-blue"
              }`}>
                <Shield size={12} />
                {member.role === "ADMIN" ? "Beheerder" : "Medewerker"}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-eritrea-gold/8 border border-eritrea-gold/20 rounded-2xl p-5 text-sm text-charcoal/70">
          <p className="font-medium text-charcoal mb-1">Medewerker toevoegen</p>
          <p>Nieuwe medewerkers kunnen zich registreren via <strong>/registreren</strong>. Daarna kunt u hun rol aanpassen via de database of het beheerdersaccount.</p>
        </div>
      </div>
    </div>
  );
}
