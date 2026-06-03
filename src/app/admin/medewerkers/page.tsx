import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { AddStaffForm } from "./AddStaffForm";
import { RoleSelector } from "./RoleSelector";

export const dynamic = "force-dynamic";

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
          <div className="flex-1">
            <h1 className="font-display text-2xl font-medium text-white">Medewerkers beheren</h1>
            <p className="text-white/40 text-sm">{staff.length} medewerkers</p>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Add staff form (admin only) */}
        <AddStaffForm />

        {/* Staff list */}
        <div className="bg-white rounded-2xl ring-1 ring-stone/40 divide-y divide-stone/30">
          {staff.map((member) => (
            <div key={member.id} className="flex items-center gap-5 px-6 py-5">
              <div className="w-12 h-12 rounded-full bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center font-bold shrink-0">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-charcoal">
                  {member.firstName} {member.lastName}
                  {member.id === session.id && (
                    <span className="ml-2 text-xs text-warm-gray/60">(u)</span>
                  )}
                </p>
                <p className="text-sm text-warm-gray flex items-center gap-1.5 mt-0.5">
                  <Mail size={12} /> {member.email}
                </p>
              </div>
              <RoleSelector
                staffId={member.id}
                currentRole={member.role}
                isCurrentUser={member.id === session.id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
