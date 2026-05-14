import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FamilieClient from "./FamilieClient";

export default async function FamiliePage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const familyMembers = await db.familyMember.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "asc" },
  });

  const serialized = familyMembers.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/mijn-account" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium text-white">Familieleden</h1>
            <p className="text-white/40 text-sm">{familyMembers.length} personen toegevoegd</p>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-2xl mx-auto px-8 py-10">
        <FamilieClient members={serialized} />
      </div>
    </div>
  );
}
