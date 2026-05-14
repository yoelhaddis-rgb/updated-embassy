import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Mail, Phone, CalendarCheck, FileText } from "lucide-react";

export default async function AdminBurgersPage() {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) redirect("/inloggen");

  const users = await db.user.findMany({
    where: { role: "CITIZEN" },
    include: {
      _count: { select: { appointments: true, documents: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium text-white">Burgerdossiers</h1>
            <p className="text-white/40 text-sm">{users.length} geregistreerde burgers</p>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="bg-white rounded-2xl ring-1 ring-stone/40 overflow-hidden">
          <table className="w-full">
            <thead className="bg-parchment/60 text-xs text-warm-gray uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Burger</th>
                <th className="px-6 py-4 text-left">Contact</th>
                <th className="px-6 py-4 text-left">Eritreas ID</th>
                <th className="px-6 py-4 text-center">Afspraken</th>
                <th className="px-6 py-4 text-center">Documenten</th>
                <th className="px-6 py-4 text-left">Geregistreerd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/30">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-parchment/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center text-sm font-bold shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-charcoal text-sm">{user.firstName} {user.lastName}</p>
                        {user.dateOfBirth && (
                          <p className="text-xs text-warm-gray">geb. {user.dateOfBirth}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs text-charcoal flex items-center gap-1.5">
                        <Mail size={11} className="text-warm-gray/50" /> {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-xs text-charcoal flex items-center gap-1.5">
                          <Phone size={11} className="text-warm-gray/50" /> {user.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-warm-gray">
                      {user.eritreanIdNumber || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-eritrea-blue">
                      <CalendarCheck size={14} />
                      <span className="text-sm font-semibold">{user._count.appointments}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-eritrea-gold-dark">
                      <FileText size={14} />
                      <span className="text-sm font-semibold">{user._count.documents}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-warm-gray">
                      {new Date(user.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
